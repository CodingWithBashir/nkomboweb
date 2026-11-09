import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';
import { getDb } from './db';

export type UserRow = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_staff: number;
  is_active: number;
  phone: string;
  address: string;
  date_of_birth: string | null;
};

const STAFF_ROLES = new Set(['admin', 'teacher', 'dos', 'headmaster']);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

export function issueToken(userId: number): string {
  const db = getDb();
  const key = crypto.randomBytes(20).toString('hex');
  db.prepare('INSERT INTO tokens (key, user_id) VALUES (?, ?)').run(key, userId);
  return key;
}

export function userFromRequest(request: NextRequest): UserRow | null {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Token\s+(\S+)$/i);
  if (!match) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.key = ? AND u.is_active = 1`
    )
    .get(match[1]) as UserRow | undefined;
  return row ?? null;
}

export function isStaff(user: UserRow | null): boolean {
  return Boolean(user && (user.is_staff === 1 || STAFF_ROLES.has(user.role)));
}

export function userJson(user: UserRow) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: [user.first_name, user.last_name].filter(Boolean).join(' '),
    role: user.role,
    is_staff: user.is_staff === 1,
    phone: user.phone,
    address: user.address,
  };
}
