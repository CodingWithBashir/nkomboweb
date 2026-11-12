/**
 * SMS and WhatsApp for the school.
 *
 * Parents in Rwanda are usually on WhatsApp or a plain phone, so the portal can
 * reach them there as well as by e-mail. Two providers are supported and both
 * are optional — without credentials every message is still written to
 * `message_log`, so the office can see exactly what was meant to go out:
 *
 *   • SMS — Africa's Talking (AT_API_KEY, AT_USERNAME, AT_SENDER), or any
 *     gateway that accepts `SMS_GATEWAY_URL` (POST {to, message} as JSON).
 *   • WhatsApp — Meta's Cloud API (WHATSAPP_TOKEN, WHATSAPP_PHONE_ID).
 *
 * Sending never throws: the result is recorded and returned.
 */

import { getDb } from './db';

export type Channel = 'sms' | 'whatsapp';

export type MessageRecord = {
  id: number;
  channel: Channel;
  recipient: string;
  body: string;
  status: 'sent' | 'queued' | 'failed';
  provider: string;
  error: string;
  student_id: number | null;
  sent_by: string;
  created_at: string;
};

function db() {
  return getDb();
}

function env(key: string) {
  return (process.env[key] || '').trim();
}

export function messagingStatus() {
  const atKey = env('AT_API_KEY');
  const atUser = env('AT_USERNAME');
  const gateway = env('SMS_GATEWAY_URL');
  const waToken = env('WHATSAPP_TOKEN');
  const waPhone = env('WHATSAPP_PHONE_ID');

  return {
    sms: {
      configured: Boolean((atKey && atUser) || gateway),
      provider: atKey && atUser ? "Africa's Talking" : gateway ? 'Custom gateway' : 'none',
      note:
        atKey && atUser
          ? 'SMS go through Africa’s Talking.'
          : gateway
            ? 'SMS go through your SMS_GATEWAY_URL.'
            : 'Add AT_API_KEY + AT_USERNAME (Africa’s Talking) or SMS_GATEWAY_URL in server/.env to send SMS.',
    },
    whatsapp: {
      configured: Boolean(waToken && waPhone),
      provider: waToken && waPhone ? 'WhatsApp Cloud API' : 'none',
      note:
        waToken && waPhone
          ? 'WhatsApp messages go through Meta’s Cloud API.'
          : 'Add WHATSAPP_TOKEN + WHATSAPP_PHONE_ID in server/.env to send WhatsApp messages.',
    },
  };
}

/** Rwanda numbers as the providers expect them: 2507XXXXXXXX, digits only. */
function normalise(number: string) {
  const digits = number.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.startsWith('250')) return digits;
  if (digits.startsWith('0')) return `25${digits}`;
  return digits;
}

async function sendSms(to: string, body: string): Promise<{ provider: string }> {
  const atKey = env('AT_API_KEY');
  const atUser = env('AT_USERNAME');
  const gateway = env('SMS_GATEWAY_URL');
  const phone = normalise(to);

  if (atKey && atUser) {
    const form = new URLSearchParams({
      username: atUser,
      to: `+${phone}`,
      message: body,
    });
    if (env('AT_SENDER')) form.set('from', env('AT_SENDER'));
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        apiKey: atKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: form.toString(),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Africa’s Talking rejected the SMS (${response.status}): ${detail.slice(0, 160)}`);
    }
    return { provider: "Africa's Talking" };
  }

  if (gateway) {
    const response = await fetch(gateway, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message: body }),
    });
    if (!response.ok) throw new Error(`The SMS gateway rejected the message (${response.status}).`);
    return { provider: 'Custom gateway' };
  }

  throw new Error('No SMS provider is configured.');
}

async function sendWhatsApp(to: string, body: string): Promise<{ provider: string }> {
  const token = env('WHATSAPP_TOKEN');
  const phoneId = env('WHATSAPP_PHONE_ID');
  if (!token || !phoneId) throw new Error('No WhatsApp provider is configured.');

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalise(to),
      type: 'text',
      text: { body },
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`WhatsApp rejected the message (${response.status}): ${detail.slice(0, 160)}`);
  }
  return { provider: 'WhatsApp Cloud API' };
}

/** Sends one message, logs it, and returns the stored row. */
export async function sendMessage(input: {
  channel: Channel;
  to: string;
  body: string;
  studentId?: number | null;
  sentBy?: string;
}): Promise<MessageRecord> {
  const recipient = (input.to || '').trim();
  const body = (input.body || '').trim();
  const status = messagingStatus();

  const created = db()
    .prepare(
      `INSERT INTO message_log (channel, recipient, body, status, provider, student_id, sent_by)
       VALUES (?, ?, ?, 'queued', ?, ?, ?)`
    )
    .run(
      input.channel,
      recipient,
      body,
      input.channel === 'sms' ? status.sms.provider : status.whatsapp.provider,
      input.studentId ?? null,
      input.sentBy || ''
    );
  const id = Number(created.lastInsertRowid);

  if (!recipient) {
    db().prepare(`UPDATE message_log SET status = 'failed', error = ? WHERE id = ?`).run(
      'No phone number for this person.',
      id
    );
    return messageById(id)!;
  }

  const configured = input.channel === 'sms' ? status.sms.configured : status.whatsapp.configured;
  if (!configured) {
    db().prepare(`UPDATE message_log SET status = 'queued', error = ? WHERE id = ?`).run(
      input.channel === 'sms' ? status.sms.note : status.whatsapp.note,
      id
    );
    return messageById(id)!;
  }

  try {
    const result =
      input.channel === 'sms' ? await sendSms(recipient, body) : await sendWhatsApp(recipient, body);
    db().prepare(
      `UPDATE message_log SET status = 'sent', provider = ?, error = '' WHERE id = ?`
    ).run(result.provider, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    db().prepare(`UPDATE message_log SET status = 'failed', error = ? WHERE id = ?`).run(
      message.slice(0, 300),
      id
    );
    console.warn('[messaging]', input.channel, 'to', recipient, 'failed:', message);
  }

  return messageById(id)!;
}

export function messageById(id: number): MessageRecord | undefined {
  return db().prepare('SELECT * FROM message_log WHERE id = ?').get(id) as MessageRecord | undefined;
}

export function messages(limit = 100): MessageRecord[] {
  return db()
    .prepare('SELECT * FROM message_log ORDER BY id DESC LIMIT ?')
    .all(Math.min(limit, 500)) as MessageRecord[];
}

/** Counters for the dashboard: how many went out, how many are stuck. */
export function messageCounts() {
  const rows = db()
    .prepare('SELECT channel, status, COUNT(*) AS total FROM message_log GROUP BY channel, status')
    .all() as { channel: string; status: string; total: number }[];
  const counts = { all: 0, sent: 0, queued: 0, failed: 0, sms: 0, whatsapp: 0 };
  for (const row of rows) {
    counts.all += row.total;
    counts.sms += row.channel === 'sms' ? row.total : 0;
    counts.whatsapp += row.channel === 'whatsapp' ? row.total : 0;
    if (row.status === 'sent') counts.sent += row.total;
    else if (row.status === 'failed') counts.failed += row.total;
    else counts.queued += row.total;
  }
  return counts;
}
