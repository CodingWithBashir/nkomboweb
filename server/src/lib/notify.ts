/**
 * Messages the school sends to people.
 *
 * Every message is stored in the `notifications` table so it can be shown in
 * the portal (and on the public application-status page). If an e-mail service
 * is configured — `RESEND_API_KEY` or `SMTP_URL` — the same message is also
 * delivered by e-mail; without it nothing breaks, the message simply stays
 * in-app.
 */

import { getDb } from './db';

export type NotificationInput = {
  userId?: number | null;
  email?: string;
  subject: string;
  body: string;
  kind?: 'application' | 'account' | 'info' | 'result';
  /** Ties the message to an application so the public status page can show it. */
  reference?: string;
};

function db() {
  return getDb();
}

/** Stores a message and (best effort) e-mails it. */
export function notify(input: NotificationInput) {
  const email = (input.email || '').trim();
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

  const id = Number(created.lastInsertRowid);
  if (email) {
    void deliver(id, email, input.subject, input.body);
  }
  return id;
}

async function deliver(id: number, email: string, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'Lycée de Nyanza <no-reply@lyceedenyanza.rw>';
  if (!key) return; // in-app only

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [email], subject, text: body }),
    });
    if (response.ok) {
      db().prepare('UPDATE notifications SET delivered = 1 WHERE id = ?').run(id);
    } else {
      const detail = await response.text().catch(() => '');
      console.warn('[notify] e-mail not delivered', response.status, detail.slice(0, 200));
    }
  } catch (error) {
    console.warn('[notify] e-mail not delivered', error);
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
