/**
 * Outgoing e-mail for the school.
 *
 * The school office may not have a mail server of its own, so delivery works
 * with whatever is available and never blocks the rest of the portal:
 *
 *   1. `SMTP_URL` or `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`
 *      → sent through that mail server (Gmail, Zoho, Mailtrap, the school's own
 *        cPanel mailbox, …). Implemented here with node:net / node:tls, so no
 *        extra package and no native build step is needed.
 *   2. `RESEND_API_KEY` → sent through the Resend HTTP API.
 *   3. Nothing configured → the message is still written to the outbox with
 *      status `logged`, so the office can read (and later re-send) everything
 *      that the portal decided to send.
 *
 * Every attempt is recorded in the `outbox` table: who it went to, the subject,
 * the exact HTML, the provider, whether it was delivered and why not.
 */

import net from 'node:net';
import tls from 'node:tls';
import { getDb } from './db';

export type MailProvider = 'smtp' | 'resend' | 'none';

export type MailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  kind?: string;
  reference?: string;
  notificationId?: number | null;
};

export type MailRecord = {
  id: number;
  to_email: string;
  subject: string;
  text: string;
  html: string;
  kind: string;
  reference: string;
  provider: MailProvider;
  status: 'queued' | 'sent' | 'logged' | 'failed';
  error: string;
  attempts: number;
  notification_id: number | null;
  created_at: string;
  sent_at: string | null;
};

export type MailStatus = {
  provider: MailProvider;
  configured: boolean;
  from: string;
  host: string;
  port: number;
  secure: boolean;
  note: string;
};

function db() {
  return getDb();
}

/**
 * Where the site is, for the links inside letters. Set `APP_URL` in production;
 * otherwise the host the office is browsing from is remembered, so a preview or
 * a staging copy links back to itself instead of the live domain.
 */
let runtimeOrigin = '';

export function rememberOrigin(origin: string) {
  const clean = (origin || '').trim().replace(/\/+$/, '');
  if (!runtimeOrigin && /^https?:\/\//i.test(clean)) runtimeOrigin = clean;
}

export function siteUrl(): string {
  const raw =
    process.env.APP_URL ||
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    runtimeOrigin ||
    'https://lyceedenyanza.rw';
  return raw.replace(/\/+$/, '');
}

const DEFAULT_FROM = 'Lycée de Nyanza <no-reply@lyceedenyanza.rw>';

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  starttls: boolean;
};

function smtpConfig(): SmtpConfig | null {
  const url = process.env.SMTP_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      const secure = parsed.protocol === 'smtps:';
      return {
        host: parsed.hostname,
        port: Number(parsed.port || (secure ? 465 : 587)),
        secure,
        user: decodeURIComponent(parsed.username || ''),
        pass: decodeURIComponent(parsed.password || ''),
        starttls: !secure,
      };
    } catch {
      console.warn('[mail] SMTP_URL could not be read, ignoring it');
    }
  }

  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const flag = (process.env.SMTP_SECURE || '').toLowerCase();
  const secure = flag === '1' || flag === 'true' || (!flag && port === 465);
  return {
    host,
    port,
    secure,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    starttls: !secure && (process.env.SMTP_STARTTLS || '').toLowerCase() !== 'false',
  };
}

function resendKey() {
  return (process.env.RESEND_API_KEY || '').trim();
}

export function mailStatus(): MailStatus {
  const from = process.env.MAIL_FROM || DEFAULT_FROM;
  const key = resendKey();
  const smtp = smtpConfig();
  if (smtp) {
    return {
      provider: 'smtp',
      configured: true,
      from,
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      note: `E-mail is sent through ${smtp.host}:${smtp.port}.`,
    };
  }
  if (key) {
    return {
      provider: 'resend',
      configured: true,
      from,
      host: 'api.resend.com',
      port: 443,
      secure: true,
      note: 'E-mail is sent through the Resend API.',
    };
  }
  return {
    provider: 'none',
    configured: false,
    from,
    host: '',
    port: 0,
    secure: false,
    note:
      'No mail server is configured, so messages are saved in the outbox but not delivered. ' +
      'Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (or SMTP_URL, or RESEND_API_KEY) in server/.env to start sending.',
  };
}

/* ------------------------------------------------------------------ encoding */

/** RFC 2047 encoded-word for anything that is not plain ASCII. */
function headerValue(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7e]*$/.test(value) && value.length < 900) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function base64Body(text: string): string {
  const encoded = Buffer.from(text, 'utf8').toString('base64');
  const chunks = encoded.match(/.{1,76}/g) || [];
  return chunks.join('\r\n');
}

function addressParts(from: string): { name: string; email: string } {
  const match = from.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: '', email: from.trim() };
}

function messageId(fromEmail: string) {
  const domain = fromEmail.split('@')[1] || 'lyceedenyanza.rw';
  return `<${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}@${domain}>`;
}

function mimeMessage(input: MailInput): { raw: string; fromEmail: string } {
  const from = process.env.MAIL_FROM || DEFAULT_FROM;
  const { name, email } = addressParts(from);
  const fromHeader = name ? `${headerValue(name)} <${email}>` : email;
  const boundary = `lycee_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const replyTo = process.env.MAIL_REPLY_TO;
  const date = new Date().toUTCString().replace('GMT', '+0000');

  const headers = [
    `From: ${fromHeader}`,
    `To: ${input.to}`,
    `Subject: ${headerValue(input.subject)}`,
    `Date: ${date}`,
    `Message-ID: ${messageId(email)}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    'X-Mailer: Lycee de Nyanza portal',
  ].filter(Boolean);

  const raw = [
    headers.join('\r\n'),
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(input.text),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(input.html),
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return { raw, fromEmail: email };
}

/* --------------------------------------------------------------- SMTP client */

type Reply = { code: number; lines: string[] };

/**
 * Tiny SMTP client: greeting, EHLO, optional STARTTLS, optional AUTH PLAIN,
 * one message, QUIT. Enough for every ordinary mail server, and small enough
 * to keep the project dependency-free.
 */
class SmtpSession {
  private socket: net.Socket;
  private buffer = '';
  private waiter: ((reply: Reply) => void) | null = null;
  private failure: Error | null = null;
  private lines: string[] = [];

  constructor(private host: string, socket: net.Socket) {
    this.socket = socket;
    this.bind(socket);
  }

  private bind(socket: net.Socket) {
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => this.feed(chunk));
    socket.on('error', (error: Error) => this.fail(error));
    socket.on('close', () => this.fail(new Error('The mail server closed the connection.')));
  }

  private fail(error: Error) {
    this.failure = this.failure || error;
    const waiter = this.waiter;
    this.waiter = null;
    waiter?.({ code: 0, lines: [error.message] });
  }

  private feed(chunk: string) {
    this.buffer += chunk;
    for (;;) {
      const index = this.buffer.indexOf('\r\n');
      if (index < 0) return;
      const line = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + 2);
      if (/^\d{3}-/.test(line)) {
        this.lines.push(line);
        continue;
      }
      const reply: Reply = { code: Number(line.slice(0, 3)), lines: [...this.lines, line] };
      this.lines = [];
      const waiter = this.waiter;
      this.waiter = null;
      waiter?.(reply);
    }
  }

  read(): Promise<Reply> {
    if (this.failure) return Promise.resolve({ code: 0, lines: [this.failure.message] });
    return new Promise((resolve) => {
      this.waiter = resolve;
    });
  }

  async command(line: string, expect: number[], label = line.split(' ')[0]): Promise<Reply> {
    this.socket.write(`${line}\r\n`);
    const reply = await this.read();
    if (!expect.includes(reply.code)) {
      throw new Error(`${label} rejected by the mail server: ${reply.lines.join(' ').slice(0, 220)}`);
    }
    return reply;
  }

  async upgrade() {
    const secured = tls.connect({ socket: this.socket, servername: this.host });
    await new Promise<void>((resolve, reject) => {
      secured.once('secureConnect', () => resolve());
      secured.once('error', (error: Error) => reject(error));
    });
    this.socket = secured;
    this.buffer = '';
    this.bind(secured);
  }

  close() {
    try {
      this.socket.end();
      this.socket.destroy();
    } catch {
      /* already gone */
    }
  }
}

function connect(config: SmtpConfig): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = config.secure
      ? tls.connect({ host: config.host, port: config.port, servername: config.host })
      : net.connect({ host: config.host, port: config.port });
    const event = config.secure ? 'secureConnect' : 'connect';
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Could not reach the mail server ${config.host}:${config.port} (timeout).`));
    }, 12000);
    timer.unref?.();
    socket.once(event, () => {
      clearTimeout(timer);
      resolve(socket as net.Socket);
    });
    socket.once('error', (error: Error) => {
      clearTimeout(timer);
      reject(new Error(`Could not reach the mail server ${config.host}:${config.port}: ${error.message}`));
    });
  });
}

async function smtpSend(config: SmtpConfig, input: MailInput) {
  const { raw, fromEmail } = mimeMessage(input);
  const socket = await connect(config);
  const session = new SmtpSession(config.host, socket);
  const timeout = setTimeout(() => session.close(), 25000);
  timeout.unref?.();

  try {
    const greeting = await session.read();
    if (greeting.code !== 220) {
      throw new Error(`The mail server refused the connection: ${greeting.lines.join(' ').slice(0, 200)}`);
    }
    const ehlo = await session.command('EHLO lyceedenyanza.rw', [250]);
    const capabilities = ehlo.lines.join('\n').toUpperCase();

    if (!config.secure && config.starttls && capabilities.includes('STARTTLS')) {
      await session.command('STARTTLS', [220]);
      await session.upgrade();
      await session.command('EHLO lyceedenyanza.rw', [250]);
    }

    if (config.user) {
      const secret = Buffer.from(`\u0000${config.user}\u0000${config.pass}`, 'utf8').toString('base64');
      const auth = await session.command(`AUTH PLAIN ${secret}`, [235, 503]);
      if (auth.code === 503) {
        // Some servers only accept the two-step LOGIN form.
        await session.command('AUTH LOGIN', [334]);
        await session.command(Buffer.from(config.user).toString('base64'), [334]);
        await session.command(Buffer.from(config.pass).toString('base64'), [235]);
      }
    }

    await session.command(`MAIL FROM:<${fromEmail}>`, [250], 'MAIL FROM');
    await session.command(`RCPT TO:<${input.to}>`, [250, 251], 'RCPT TO');
    await session.command('DATA', [354], 'DATA');
    // Dot-stuffing, as required by RFC 5321.
    const body = raw.replace(/\r\n\./g, '\r\n..');
    await session.command(`${body}\r\n.`, [250], 'Message body');
    await session.command('QUIT', [221]).catch(() => undefined);
  } finally {
    clearTimeout(timeout);
    session.close();
  }
}

async function resendSend(input: MailInput) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend rejected the message (${response.status}): ${detail.slice(0, 200)}`);
  }
}

/* ------------------------------------------------------------------ outbox */

function row(id: number): MailRecord | undefined {
  return db().prepare('SELECT * FROM outbox WHERE id = ?').get(id) as MailRecord | undefined;
}

/**
 * Writes the message to the outbox and tries to deliver it.
 * Resolves with the final record (never throws) so callers can report status.
 */
export async function sendMail(input: MailInput): Promise<MailRecord> {
  const status = mailStatus();
  const email = (input.to || '').trim();
  if (!email) throw new Error('A message needs a recipient e-mail address.');

  const created = db()
    .prepare(
      `INSERT INTO outbox (to_email, subject, text, html, kind, reference, provider, status, notification_id, attempts)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', ?, 0)`
    )
    .run(
      email,
      input.subject,
      input.text,
      input.html,
      input.kind || 'info',
      input.reference || '',
      status.provider,
      input.notificationId ?? null
    );

  const id = Number(created.lastInsertRowid);

  if (status.provider === 'none') {
    db().prepare(
      `UPDATE outbox SET status = 'logged', attempts = 1, error = ? WHERE id = ?`
    ).run('No mail server configured — saved to the outbox only.', id);
    return row(id)!;
  }

  try {
    if (status.provider === 'smtp') {
      await smtpSend({ ...smtpConfig()!, }, input);
    } else {
      await resendSend(input);
    }
    db().prepare(
      `UPDATE outbox SET status = 'sent', attempts = attempts + 1, error = '', sent_at = datetime('now')
        WHERE id = ?`
    ).run(id);
    if (input.notificationId) {
      db().prepare('UPDATE notifications SET delivered = 1 WHERE id = ?').run(input.notificationId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    db().prepare(
      `UPDATE outbox SET status = 'failed', attempts = attempts + 1, error = ? WHERE id = ?`
    ).run(message.slice(0, 500), id);
    console.warn('[mail] not delivered to', email, '-', message);
  }

  return row(id)!;
}

/** One outbox entry (with its HTML), or undefined. */
export function mailById(id: number): MailRecord | undefined {
  if (!Number.isFinite(id) || id <= 0) return undefined;
  return row(id);
}

/** Removes an entry from the outbox (the message itself is not recalled). */
export function deleteMail(id: number) {
  db().prepare('DELETE FROM outbox WHERE id = ?').run(id);
}

/** Re-sends an outbox entry exactly as it was written. */
export async function resendMail(id: number): Promise<MailRecord> {
  const record = row(id);
  if (!record) throw new Error('That message is not in the outbox.');
  return sendMail({
    to: record.to_email,
    subject: record.subject,
    text: record.text,
    html: record.html,
    kind: record.kind,
    reference: record.reference,
    notificationId: record.notification_id,
  });
}

export type OutboxFilter = { status?: string; q?: string; limit?: number };

export function outbox(filter: OutboxFilter = {}): MailRecord[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filter.status && filter.status !== 'all') {
    clauses.push('status = ?');
    params.push(filter.status);
  }
  if (filter.q) {
    clauses.push('(lower(to_email) LIKE ? OR lower(subject) LIKE ?)');
    const like = `%${filter.q.toLowerCase()}%`;
    params.push(like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(Math.min(filter.limit ?? 200, 500));
  return db()
    .prepare(`SELECT * FROM outbox ${where} ORDER BY id DESC LIMIT ?`)
    .all(...params) as MailRecord[];
}

export function outboxCounts() {
  const rows = db()
    .prepare('SELECT status, COUNT(*) AS total FROM outbox GROUP BY status')
    .all() as { status: string; total: number }[];
  const counts = { all: 0, sent: 0, logged: 0, failed: 0, queued: 0 };
  for (const item of rows) {
    counts[item.status as keyof typeof counts] = item.total;
    counts.all += item.total;
  }
  return counts;
}

/** Latest delivery attempt for an address — shown next to each registration. */
export function lastDeliveryFor(email: string) {
  if (!email) return null;
  const record = db()
    .prepare('SELECT status, error, sent_at, created_at, subject FROM outbox WHERE lower(to_email) = lower(?) ORDER BY id DESC LIMIT 1')
    .get(email) as Pick<MailRecord, 'status' | 'error' | 'sent_at' | 'created_at' | 'subject'> | undefined;
  return record ?? null;
}
