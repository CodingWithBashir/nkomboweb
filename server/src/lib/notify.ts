/**
 * Messages the school sends to people.
 *
 * Every message is stored in the `notifications` table so it can be shown in
 * the portal (and on the public application-status page). When an e-mail
 * address is known the same message is also written to the outbox and sent —
 * through the school's mail server, Resend, or not at all (in which case it
 * waits in the outbox and can be re-sent later). See `mail.ts` for delivery.
 */

import { getDb } from './db';
import { generalEmail } from './emailTemplates';
import { sendMail, type MailRecord } from './mail';

export type NotificationInput = {
  userId?: number | null;
  email?: string;
  subject: string;
  body: string;
  kind?: 'application' | 'account' | 'info' | 'result';
  /** Ties the message to an application so the public status page can show it. */
  reference?: string;
  /** First name, used to greet the reader in the e-mail version. */
  name?: string;
  /** Pre-rendered HTML (otherwise a branded layout is generated from `body`). */
  html?: string;
};

export type DeliveryResult = { id: number; delivery: MailRecord | null };

function db() {
  return getDb();
}

function insert(input: NotificationInput, email: string) {
  const created = db()
    .prepare(
      `INSERT INTO notifications (user_id, email, subject, body, kind, reference, channel, delivered)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(
      input.userId ?? null,
      email,
      input.subject,
      input.body,
      input.kind || 'info',
      input.reference || '',
      email ? 'in-app+email' : 'in-app'
    );
  return Number(created.lastInsertRowid);
}

function mailFor(input: NotificationInput, notificationId: number) {
  const rendered = input.html
    ? {
        subject: input.subject,
        html: input.html,
        text: input.body,
      }
    : generalEmail({
        subject: input.subject,
        body: input.body,
        kind: input.kind,
        reference: input.reference,
        name: input.name,
      });

  return sendMail({
    to: (input.email || '').trim(),
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    kind: input.kind || 'info',
    reference: input.reference || '',
    notificationId,
  });
}

/** Stores a message and (best effort) e-mails it. Returns the notification id. */
export function notify(input: NotificationInput) {
  const email = (input.email || '').trim();
  const id = insert(input, email);
  if (email) {
    void mailFor(input, id).catch((error) => {
      console.warn('[notify] e-mail failed', email, error instanceof Error ? error.message : error);
    });
  }
  return id;
}

/**
 * Same as `notify`, but waits for the delivery attempt so the caller can tell
 * the office whether the letter really left the building.
 */
export async function notifyAndDeliver(input: NotificationInput): Promise<DeliveryResult> {
  const email = (input.email || '').trim();
  const id = insert(input, email);
  if (!email) return { id, delivery: null };
  try {
    return { id, delivery: await mailFor(input, id) };
  } catch (error) {
    console.warn('[notify] e-mail failed', email, error instanceof Error ? error.message : error);
    return { id, delivery: null };
  }
}

/** Messages for one account, newest first. */
export function notificationsFor(userId: number, limit = 30) {
  return db()
    .prepare(
      `SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?`
    )
    .all(userId, limit) as Record<string, unknown>[];
}

/** Messages tied to one application reference (public status page). */
export function notificationsForReference(reference: string, limit = 5) {
  if (!reference) return [];
  return db()
    .prepare(
      `SELECT id, subject, body, created_at FROM notifications
        WHERE reference = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?`
    )
    .all(reference, limit) as Record<string, unknown>[];
}

/** Messages sent to an e-mail address (used by the public status page). */
export function notificationsForEmail(email: string, limit = 10) {
  if (!email) return [];
  return db()
    .prepare(
      `SELECT * FROM notifications
        WHERE lower(email) = lower(?)
        ORDER BY created_at DESC, id DESC
        LIMIT ?`
    )
    .all(email, limit) as Record<string, unknown>[];
}
