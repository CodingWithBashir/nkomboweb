import crypto from 'node:crypto';

/**
 * Supabase identity helpers.
 *
 * The site's API runs in an environment that does not talk to Supabase over the
 * network, so a Supabase session is proven in one of two ways:
 *
 * 1. `SUPABASE_JWT_SECRET` — when set, the access token is verified locally
 *    (HS256), which is the classic Supabase JWT flow.
 * 2. The `session-bridge` edge function — it runs inside Supabase, so the
 *    platform has already verified the token. It returns a short-lived
 *    assertion signed with a secret shared with this API.
 *
 * Both paths are checked here; anything else is rejected.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmsfhjqhuqdldzkoxozc.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc2ZoanFodXFkbGR6a294b3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMjY5MDcsImV4cCI6MjEwOTgwMjkwN30.DkkyPT4Lk88hYyNKdyrZNd0oJtWwD4HNRCcDQZBTxbY';

export const SUPABASE_BRIDGE_URL = `${SUPABASE_URL}/functions/v1/session-bridge`;

/**
 * Shared with the `session-bridge` edge function (Supabase secret
 * SCHOOL_BRIDGE_SECRET). Override it in the environment to rotate.
 */
export const BRIDGE_SECRET =
  process.env.SUPABASE_BRIDGE_SECRET || '83ddf357c00a471746a5c3145b4e58e58656bc3363cd4cca0e3f95795525f017';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

export type SupabaseIdentity = { uid: string; email: string };

export type BridgeAssertion = {
  uid?: unknown;
  email?: unknown;
  exp?: unknown;
  sig?: unknown;
  full_name?: unknown;
};

function base64urlToBuffer(value: string) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function signBridgeMessage(message: string, secret = BRIDGE_SECRET) {
  const digest = crypto.createHmac('sha256', secret).update(message).digest();
  return digest.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Validates the edge function assertion (`uid|email|exp` signed with HMAC). */
export function verifyBridgeAssertion(assertion: BridgeAssertion): SupabaseIdentity | null {
  const uid = typeof assertion.uid === 'string' ? assertion.uid.trim() : '';
  const email = typeof assertion.email === 'string' ? assertion.email.trim().toLowerCase() : '';
  const sig = typeof assertion.sig === 'string' ? assertion.sig.trim() : '';
  const exp = Number(assertion.exp);
  if (!uid || !sig || !Number.isFinite(exp)) return null;
  if (exp * 1000 < Date.now() - 60_000) return null;

  const expected = signBridgeMessage(`${uid}|${email}|${exp}`);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return { uid, email };
}

/**
 * Verifies a Supabase access token locally when the project's JWT secret is
 * configured (`SUPABASE_JWT_SECRET`). Returns null when it cannot be checked.
 */
export function verifyAccessToken(token: string): SupabaseIdentity | null {
  if (!JWT_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;
  let header: { alg?: string };
  let payload: { sub?: string; email?: string; exp?: number; role?: string };
  try {
    header = JSON.parse(base64urlToBuffer(headerPart).toString('utf8'));
    payload = JSON.parse(base64urlToBuffer(payloadPart).toString('utf8'));
  } catch {
    return null;
  }
  if (header.alg !== 'HS256') return null;

  const expected = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerPart}.${payloadPart}`)
    .digest();
  const provided = base64urlToBuffer(signaturePart);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return null;
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null;
  if (!payload.sub || payload.role !== 'authenticated') return null;

  return { uid: payload.sub, email: (payload.email ?? '').toLowerCase() };
}

export type { };
