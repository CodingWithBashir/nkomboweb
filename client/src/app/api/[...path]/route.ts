import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, UPLOAD_DIR } from '@/lib/server/db';
import { seedDatabase } from '@/lib/server/seed';
import {
  hashPassword,
  isStaff,
  issueToken,
  userFromRequest,
  userJson,
  verifyPassword,
  type UserRow,
} from '@/lib/server/auth';
import {
  SUPABASE_URL,
  verifyAccessToken,
  verifyBridgeAssertion,
  type BridgeAssertion,
} from '@/lib/server/supabaseAuth';
import { error, json, noContent, paginate, readJson, str } from '@/lib/server/http';
import {
  ATTENDANCE_SELECT,
  GRADE_SELECT,
  STUDENT_SELECT,
  allTrades,
  attendanceJson,
  departmentJson,
  gradeJson,
  holidayJson,
  newsJson,
  programJson,
  resourceJson,
  publicStudents,
  studentById,
  studentJson,
  subjectById,
  subjectJson,
  teacherBySlug,
  teachers as teacherList,
  tradeBySlug,
} from '@/lib/server/queries';

/**
 * The Lycée de Nyanza school API, served by Next.js route handlers.
 *
 * Every endpoint keeps the URL, payload and response shape the frontend
 * already uses: trailing-slash paths, paginated `{count,next,previous,results}`
 * envelopes, `Token <key>` authentication and the same field names.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: { path?: string[] } };

/* ------------------------------------------------------------------ helpers */

function rows<T = Record<string, any>>(sql: string, params: unknown[] = []): T[] {
  return getDb()
    .prepare(sql)
    .all(...(params as any[])) as T[];
}

/** Single row; `undefined` when the query matches nothing. */
function maybeRow<T = Record<string, any>>(sql: string, params: unknown[] = []): T | undefined {
  return getDb()
    .prepare(sql)
    .get(...(params as any[])) as T | undefined;
}

/** Single row for paths that have already checked existence. */
function row<T = Record<string, any>>(sql: string, params: unknown[] = []): T {
  return getDb()
    .prepare(sql)
    .get(...(params as any[])) as T;
}

function exec(sql: string, params: unknown[] = []) {
  return getDb()
    .prepare(sql)
    .run(...(params as any[]));
}

function boolValue(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return undefined;
}

function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

function uniqueSlug(table: string, base: string, excludeId?: number) {
  let candidate = slugify(base);
  let counter = 1;
  for (;;) {
    const existing = maybeRow<{ id: number }>(
      `SELECT id FROM ${table} WHERE slug = ?${excludeId ? ' AND id != ?' : ''}`,
      excludeId ? [candidate, excludeId] : [candidate]
    );
    if (!existing) return candidate;
    counter += 1;
    candidate = `${slugify(base)}-${counter}`;
  }
}

function originOf(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  return `${proto}://${host}`;
}

function ensureSeeded() {
  try {
    seedDatabase();
  } catch (err) {
    console.error('[api] database seed failed', err);
  }
}

function requireUser(request: NextRequest): { user: UserRow } | { response: Response } {
  const user = userFromRequest(request);
  if (!user) return { response: error('Authentication credentials were not provided.', 401) };
  return { user };
}

function requireStaff(request: NextRequest): { user: UserRow } | { response: Response } {
  const user = userFromRequest(request);
  if (!user) return { response: error('Authentication credentials were not provided.', 401) };
  if (!isStaff(user)) return { response: error('You do not have permission to do that.', 403) };
  return { user };
}

/** Head teacher, admin and director of studies manage the staff directory. */
function canManageStaff(user: UserRow | null) {
  return Boolean(
    user && (user.role === 'headmaster' || user.role === 'admin' || user.role === 'dos')
  );
}

const MANAGER_ROLES = new Set(['headmaster', 'admin', 'dos']);

function studentOf(user: UserRow) {
  return row<Record<string, any>>(`${STUDENT_SELECT} WHERE s.user_id = ?`, [user.id]);
}

function filtered(
  baseSql: string,
  url: URL,
  filters: Record<string, string>,
  searchColumns: string[] = []
) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const [param, column] of Object.entries(filters)) {
    const value = url.searchParams.get(param);
    if (value === null || value === '') continue;
    if (value === 'true' || value === 'false') {
      clauses.push(`${column} = ?`);
      params.push(value === 'true' ? 1 : 0);
    } else if (/^-?\d+$/.test(value) && !column.includes('date') && !column.includes('term')) {
      clauses.push(`${column} = ?`);
      params.push(Number(value));
    } else {
      clauses.push(`${column} = ?`);
      params.push(value);
    }
  }
  const search = url.searchParams.get('search');
  if (search && searchColumns.length) {
    clauses.push(`(${searchColumns.map((col) => `${col} LIKE ?`).join(' OR ')})`);
    searchColumns.forEach(() => params.push(`%${search}%`));
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { sql: `${baseSql} ${where}`, params };
}

const TEACHER_ORDER: Record<string, string> = {
  order: 't.order_index',
  order_index: 't.order_index',
  years_experience: 't.years_experience',
  is_hod: 't.is_hod',
  name: 'u.first_name',
};

function orderClause(url: URL, allowed: Record<string, string>, fallback: string) {
  const requested = url.searchParams.get('ordering');
  if (!requested) return `ORDER BY ${fallback}`;
  const descending = requested.startsWith('-');
  const key = descending ? requested.slice(1) : requested;
  const column = allowed[key];
  if (!column) return `ORDER BY ${fallback}`;
  return `ORDER BY ${column} ${descending ? 'DESC' : 'ASC'}`;
}

/* --------------------------------------------------------------------- auth */

async function authRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const [action] = segs;

  if (action === 'login' && request.method === 'POST') {
    const body = await readJson(request);
    const username = str(body.username);
    const password = str(body.password);
    if (!username || !password) {
      return json({ username: ['This field is required.'], password: ['This field is required.'] }, 400);
    }
    const user = maybeRow<UserRow & { password: string }>(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
      [username, username]
    );
    if (!user || !verifyPassword(password, user.password)) {
      return json({ error: 'Invalid credentials', detail: 'Invalid credentials' }, 401);
    }
    const token = issueToken(user.id);
    return json({ token, user: userJson(user) });
  }

  if (action === 'register' && request.method === 'POST') {
    const body = await readJson(request);
    const username = str(body.username);
    const password = str(body.password);
    if (!username) return json({ username: ['This field is required.'] }, 400);
    if (password.length < 8) {
      return json({ password: ['This password is too short. It must contain at least 8 characters.'] }, 400);
    }
    if (maybeRow('SELECT id FROM users WHERE username = ?', [username])) {
      return json({ username: ['A user with that username already exists.'] }, 400);
    }
    const created = exec(
      `INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, phone)
       VALUES (?, ?, ?, ?, ?, 'student', 0, ?)`,
      [
        username,
        str(body.email),
        hashPassword(password),
        str(body.first_name),
        str(body.last_name),
        str(body.phone),
      ]
    );
    const user = row<UserRow>('SELECT * FROM users WHERE id = ?', [created.lastInsertRowid])!;
    return json({ token: issueToken(user.id), user: userJson(user) }, 201);
  }

  if (action === 'supabase' && request.method === 'POST') {
    const body = await readJson(request);
    const assertion = (body.bridge ?? null) as BridgeAssertion | null;
    const accessToken = str(body.access_token);

    let identity = assertion ? verifyBridgeAssertion(assertion) : null;
    if (!identity && accessToken) identity = verifyAccessToken(accessToken);
    if (!identity) {
      return json({ detail: 'That session could not be verified. Please sign in again.' }, 401);
    }

    const user = resolveSupabaseUser(identity.uid, identity.email, str(body.full_name));
    if (!user) return error('No account is linked to that identity.', 403);
    if (user.supabase_uid !== identity.uid) {
      exec('UPDATE users SET supabase_uid = ? WHERE id = ?', [identity.uid, user.id]);
      user.supabase_uid = identity.uid;
    }
    return json({ token: issueToken(user.id), user: userJson(user) });
  }

  if (action === 'logout' && request.method === 'POST') {
    const header = request.headers.get('authorization') || '';
    const key = header.replace(/^Token\s+/i, '').trim();
    if (key) exec('DELETE FROM tokens WHERE key = ?', [key]);
    return noContent();
  }

  if (action === 'profile') {
    const auth = requireUser(request);
    if ('response' in auth) return auth.response;
    if (request.method === 'GET') return json(userJson(auth.user));
    if (request.method === 'PATCH' || request.method === 'PUT') {
      const body = await readJson(request);
      exec(
        `UPDATE users SET email = COALESCE(NULLIF(?,''), email),
                          first_name = COALESCE(NULLIF(?,''), first_name),
                          last_name = COALESCE(NULLIF(?,''), last_name),
                          phone = COALESCE(?, phone),
                          address = COALESCE(?, address),
                          date_of_birth = COALESCE(?, date_of_birth)
         WHERE id = ?`,
        [
          str(body.email),
          str(body.first_name),
          str(body.last_name),
          body.phone === undefined ? null : str(body.phone),
          body.address === undefined ? null : str(body.address),
          body.date_of_birth === undefined ? null : str(body.date_of_birth),
          auth.user.id,
        ]
      );
      return json(userJson(row<UserRow>('SELECT * FROM users WHERE id = ?', [auth.user.id])!));
    }
    return error('Method not allowed.', 405);
  }

  if (action === 'users') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const list = rows<UserRow>('SELECT * FROM users ORDER BY id ASC').map(userJson);
    return json(paginate(list, new URL(request.url)));
  }

  return error('Not found.', 404);
}

/* ----------------------------------------------------------------- teachers */

function teacherRoute(request: NextRequest, segs: string[]): Response | Promise<Response> {
  const origin = originOf(request);
  const url = new URL(request.url);
  const [identifier] = segs;

  if (!identifier) {
    if (request.method === 'GET') {
      const auth = requireUser(request);
      const showAll = !('response' in auth) && isStaff(auth.user);
      const filters: Record<string, string> = { trade: 't.trade_id', department: 't.department_id' };
      if (!showAll) filters.is_public = 't.is_public';
      const { sql, params } = filtered(
        `SELECT t.id FROM teachers t JOIN users u ON u.id = t.user_id`,
        url,
        filters,
        ['u.first_name', 'u.last_name', 't.qualification', 't.title']
      );
      const ids = rows<{ id: number }>(sql, params).map((r) => r.id);
      const all = teacherList(origin, {})
        .filter((teacher) => ids.includes(teacher.id))
        .sort((a, b) => {
          if (a.is_hod !== b.is_hod) return a.is_hod ? -1 : 1;
          return (a.order ?? 0) - (b.order ?? 0);
        });
      return json(paginate(all, url));
    }

    if (request.method === 'POST') {
      // Any staff member may add a colleague; only managers can remove one.
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      return createTeacher(request);
    }
    return error('Method not allowed.', 405);
  }

  const teacher = teacherBySlug(identifier, origin);
  if (!teacher) return error('Not found.', 404);

  if (request.method === 'GET') return json(teacher);

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    if (!canManageStaff(auth.user)) {
      return error('Only the head teacher or director of studies can remove staff.', 403);
    }
    const existing = row<{ user_id: number }>('SELECT user_id FROM teachers WHERE id = ?', [teacher.id]);
    exec('DELETE FROM teachers WHERE id = ?', [teacher.id]);
    if (existing) exec('DELETE FROM users WHERE id = ? AND role = ?', [existing.user_id, 'teacher']);
    return noContent();
  }

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const ownsProfile = row<{ id: number }>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [auth.user.id]
    );
    if (!canManageStaff(auth.user) && ownsProfile?.id !== teacher.id) {
      return error('You can only edit your own profile.', 403);
    }
    return updateTeacher(request, teacher.id, auth.user);
  }

  return error('Method not allowed.', 405);
}

async function createTeacher(request: NextRequest): Promise<Response> {
  const auth = requireStaff(request);
  if ('response' in auth) return auth.response;

  const body = await readJson(request);
  const name = str(body.name);
  if (!name) return json({ name: ['A teacher name is required.'] }, 400);

  const tradeId = numberValue(body.trade_id);
  const trade = tradeId
    ? row<{ id: number; department_id: number }>(
        `SELECT tr.id, p.department_id FROM trades tr JOIN programs p ON p.id = tr.program_id WHERE tr.id = ?`,
        [tradeId]
      )
    : undefined;
  const departmentId =
    numberValue(body.department_id) ?? trade?.department_id ?? row<{ id: number }>('SELECT id FROM departments ORDER BY id LIMIT 1')?.id;
  if (!departmentId) return json({ department_id: ['A department is required.'] }, 400);

  const parts = name.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  const base = slugify(lastName ? `${firstName}.${lastName}` : firstName);
  let username = base;
  let counter = 1;
  while (maybeRow('SELECT id FROM users WHERE username = ?', [username])) {
    counter += 1;
    username = `${base}${counter}`;
  }

  const created = exec(
    `INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, phone)
     VALUES (?, ?, ?, ?, ?, 'teacher', 1, ?)`,
    [
      username,
      str(body.email),
      hashPassword(str(body.password) || 'teacher123'),
      firstName,
      lastName,
      str(body.phone),
    ]
  );
  const userId = Number(created.lastInsertRowid);
  const sequence = row<{ count: number }>('SELECT COUNT(*) AS count FROM teachers')?.count ?? 0;

  const insert = exec(
    `INSERT INTO teachers (user_id, employee_id, department_id, trade_id, slug, title, is_hod, bio,
                           levels, classes, email, phone, years_experience, is_public, order_index,
                           qualification, hire_date, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      str(body.employee_id) || `TCH${String(sequence + 1).padStart(4, '0')}`,
      departmentId,
      tradeId,
      uniqueSlug('teachers', name),
      str(body.title) || 'Trainer',
      boolValue(body.is_hod) ? 1 : 0,
      str(body.bio),
      str(body.levels) || 'L3',
      str(body.classes),
      str(body.email),
      str(body.phone),
      Number(body.years_experience) || 0,
      boolValue(body.is_public) === false ? 0 : 1,
      Number(body.order) || 0,
      str(body.qualification),
      str(body.hire_date) || new Date().toISOString().slice(0, 10),
      str(body.photo) || null,
    ]
  );

  const created_teacher = teacherBySlug(
    String(row<{ slug: string }>('SELECT slug FROM teachers WHERE id = ?', [insert.lastInsertRowid])?.slug),
    originOf(request)
  );
  return json(created_teacher, 201);
}

async function updateTeacher(request: NextRequest, id: number, actor: UserRow): Promise<Response> {
  const body = await readJson(request);
  const existing = maybeRow<Record<string, any>>('SELECT * FROM teachers WHERE id = ?', [id]);
  if (!existing) return error('Not found.', 404);

  // A teacher may correct their own details, but only managers move people
  // between trades, grant HOD status or hide a profile from the website.
  if (!canManageStaff(actor)) {
    delete body.is_hod;
    delete body.trade_id;
    delete body.department_id;
    delete body.is_public;
    delete body.order;
  }

  const name = str(body.name);
  const userId = Number(existing.user_id);
  if (name) {
    const parts = name.split(/\s+/);
    exec('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [
      parts[0],
      parts.slice(1).join(' '),
      userId,
    ]);
    const base = slugify(parts.slice(1).length ? `${parts[0]}-${parts.slice(1).join(' ')}` : parts[0]);
    if (slugify(String(existing.slug)) !== base) {
      exec('UPDATE teachers SET slug = ? WHERE id = ?', [uniqueSlug('teachers', name, id), id]);
    }
  }
  if (str(body.email)) exec('UPDATE users SET email = ? WHERE id = ?', [str(body.email), userId]);
  if (str(body.password)) {
    exec('UPDATE users SET password = ? WHERE id = ?', [hashPassword(str(body.password)), userId]);
  }

  const tradeId = body.trade_id === undefined ? existing.trade_id : numberValue(body.trade_id);
  const trade = tradeId
    ? row<{ department_id: number }>(
        `SELECT p.department_id FROM trades tr JOIN programs p ON p.id = tr.program_id WHERE tr.id = ?`,
        [tradeId]
      )
    : undefined;

  exec(
    `UPDATE teachers SET
        trade_id = ?, department_id = ?, title = ?, is_hod = ?, bio = ?, levels = ?, classes = ?,
        email = ?, phone = ?, years_experience = ?, is_public = ?, order_index = ?,
        qualification = ?, hire_date = ?, photo = ?
      WHERE id = ?`,
    [
      tradeId,
      numberValue(body.department_id) ?? trade?.department_id ?? existing.department_id,
      str(body.title) || existing.title,
      body.is_hod === undefined ? existing.is_hod : boolValue(body.is_hod) ? 1 : 0,
      body.bio === undefined ? existing.bio : str(body.bio),
      body.levels === undefined ? existing.levels : str(body.levels),
      body.classes === undefined ? existing.classes : str(body.classes),
      body.email === undefined ? existing.email : str(body.email),
      body.phone === undefined ? existing.phone : str(body.phone),
      body.years_experience === undefined ? existing.years_experience : Number(body.years_experience) || 0,
      body.is_public === undefined ? existing.is_public : boolValue(body.is_public) === false ? 0 : 1,
      body.order === undefined ? existing.order_index : Number(body.order) || 0,
      body.qualification === undefined ? existing.qualification : str(body.qualification),
      body.hire_date === undefined ? existing.hire_date : str(body.hire_date),
      body.photo === undefined ? existing.photo : str(body.photo) || null,
      id,
    ]
  );

  const slug = row<{ slug: string }>('SELECT slug FROM teachers WHERE id = ?', [id])?.slug;
  return json(teacherBySlug(String(slug), originOf(request)));
}

/* ---------------------------------------------------------------- students */

async function studentRoutes(
  request: NextRequest,
  rest: string[],
  origin: string,
  url: URL
): Promise<Response> {
  const [identifier] = rest;

  if (identifier === 'me') {
    const auth = requireUser(request);
    if ('response' in auth) return auth.response;
    const student = studentOf(auth.user);
    if (!student) return error('This account has no student profile.', 404);
    return json(studentJson(student, origin));
  }

  // Public directory: only students an administrator marked as listed.
  if (identifier === 'directory') {
    if (request.method !== 'GET') return error('Method not allowed.', 405);
    const list = publicStudents(origin, {
      trade: url.searchParams.get('trade') ?? undefined,
      level: url.searchParams.get('level') ?? undefined,
    });
    return json(paginate(list, url));
  }

  if (!identifier) {
    if (request.method === 'GET') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const { sql, params } = filtered(
        STUDENT_SELECT,
        url,
        {
          program: 's.program_id',
          trade: 'tr.id',
          level: 's.level',
          is_active: 's.is_active',
          gender: 's.gender',
        },
        ['u.first_name', 'u.last_name', 's.student_id']
      );
      const list = rows(`${sql} ORDER BY s.level DESC, u.last_name ASC`, params).map((item) =>
        studentJson(item, origin)
      );
      return json(paginate(list, url));
    }

    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);

      let userId = numberValue(body.user_id);
      const name = str(body.name);
      if (!userId) {
        if (!name) return json({ name: ['A student name is required.'] }, 400);
        const parts = name.split(/\s+/);
        const base = slugify(parts.slice(1).length ? `${parts[0]}.${parts.slice(1).join(' ')}` : parts[0]);
        let username = base;
        let counter = 1;
        while (maybeRow('SELECT id FROM users WHERE username = ?', [username])) {
          counter += 1;
          username = `${base}${counter}`;
        }
        const created = exec(
          `INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, phone)
           VALUES (?, ?, ?, ?, ?, 'student', 0, ?)`,
          [
            username,
            str(body.email),
            hashPassword(str(body.password) || 'Student@2026'),
            parts[0],
            parts.slice(1).join(' '),
            str(body.parent_phone),
          ]
        );
        userId = Number(created.lastInsertRowid);
      }

      let programId = numberValue(body.program_id);
      const tradeId = numberValue(body.trade_id);
      if (!programId && tradeId) {
        programId =
          maybeRow<{ program_id: number }>('SELECT program_id FROM trades WHERE id = ?', [tradeId])
            ?.program_id ?? null;
      }
      if (!programId) return json({ program_id: ['Choose the trade this student joined.'] }, 400);

      const sequence = maybeRow<{ count: number }>('SELECT COUNT(*) AS count FROM students')?.count ?? 0;
      const studentCode =
        str(body.student_id) ||
        `LDN-${new Date().getFullYear()}-${String(sequence + 1).padStart(3, '0')}`;

      const created = exec(
        `INSERT INTO students (user_id, student_id, program_id, enrollment_date, date_of_birth, gender,
                               parent_name, parent_phone, address, level, promotion_year, photo,
                               is_public, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          studentCode,
          programId,
          str(body.enrollment_date) || new Date().toISOString().slice(0, 10),
          str(body.date_of_birth) || '2008-01-01',
          str(body.gender) || 'M',
          str(body.parent_name),
          str(body.parent_phone),
          str(body.address),
          str(body.level) || 'L3',
          Number(body.promotion_year) || new Date().getFullYear(),
          str(body.photo) || null,
          boolValue(body.is_public) === false ? 0 : 1,
          boolValue(body.is_active) === false ? 0 : 1,
        ]
      );
      return json(studentById(Number(created.lastInsertRowid), origin), 201);
    }

    return error('Method not allowed.', 405);
  }

  const student = studentById(Number(identifier), origin);
  if (!student) return error('Not found.', 404);

  if (request.method === 'GET') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    return json(student);
  }

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    const existing = row<Record<string, any>>('SELECT * FROM students WHERE id = ?', [student.id]);

    if (str(body.name)) {
      const parts = str(body.name).split(/\s+/);
      exec('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [
        parts[0],
        parts.slice(1).join(' '),
        existing.user_id,
      ]);
    }
    if (body.email !== undefined) {
      exec('UPDATE users SET email = ? WHERE id = ?', [str(body.email), existing.user_id]);
    }

    exec(
      `UPDATE students SET program_id = ?, level = ?, promotion_year = ?, photo = ?, gender = ?,
                           date_of_birth = ?, parent_name = ?, parent_phone = ?, address = ?,
                           is_public = ?, is_active = ?
       WHERE id = ?`,
      [
        numberValue(body.program_id) ?? existing.program_id,
        str(body.level) || existing.level,
        body.promotion_year === undefined ? existing.promotion_year : Number(body.promotion_year) || 0,
        body.photo === undefined ? existing.photo : str(body.photo) || null,
        str(body.gender) || existing.gender,
        str(body.date_of_birth) || existing.date_of_birth,
        body.parent_name === undefined ? existing.parent_name : str(body.parent_name),
        body.parent_phone === undefined ? existing.parent_phone : str(body.parent_phone),
        body.address === undefined ? existing.address : str(body.address),
        body.is_public === undefined ? existing.is_public : boolValue(body.is_public) === false ? 0 : 1,
        body.is_active === undefined ? existing.is_active : boolValue(body.is_active) === false ? 0 : 1,
        student.id,
      ]
    );
    return json(studentById(student.id, origin));
  }

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    if (!canManageStaff(auth.user)) {
      return error('Only the head teacher or director of studies can remove a student.', 403);
    }
    const existing = row<{ user_id: number }>('SELECT user_id FROM students WHERE id = ?', [student.id]);
    exec('DELETE FROM students WHERE id = ?', [student.id]);
    exec('DELETE FROM users WHERE id = ? AND role = ?', [existing.user_id, 'student']);
    return noContent();
  }

  return error('Method not allowed.', 405);
}

/* -------------------------------------------------------------------- trades */

async function tradeRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const origin = originOf(request);
  const url = new URL(request.url);
  const [identifier] = segs;

  if (!identifier) {
    if (request.method === 'GET') {
      const auth = requireUser(request);
      const staff = !('response' in auth) && isStaff(auth.user);
      let list = allTrades(origin, staff);
      const code = url.searchParams.get('code');
      if (code) list = list.filter((trade) => trade.code === code);
      const search = url.searchParams.get('search')?.toLowerCase();
      if (search) {
        list = list.filter(
          (trade) =>
            trade.name.toLowerCase().includes(search) ||
            (trade.summary ?? '').toLowerCase().includes(search) ||
            trade.code.toLowerCase().includes(search)
        );
      }
      return json(paginate(list, url));
    }

    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const programId = numberValue(body.program_id);
      if (!programId) return json({ program_id: ['A program is required.'] }, 400);
      const created = exec(
        `INSERT INTO trades (program_id, slug, code, tagline, summary, description, icon, image,
                             entry_requirements, career_paths, curriculum, is_active, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          programId,
          uniqueSlug('trades', str(body.slug) || str(body.code) || 'trade'),
          str(body.code),
          str(body.tagline),
          str(body.summary),
          str(body.description),
          str(body.icon) || 'code',
          str(body.image),
          str(body.entry_requirements),
          JSON.stringify(body.career_paths ?? []),
          JSON.stringify(body.curriculum ?? []),
          boolValue(body.is_active) === false ? 0 : 1,
          Number(body.order) || 0,
        ]
      );
      const slug = row<{ slug: string }>('SELECT slug FROM trades WHERE id = ?', [created.lastInsertRowid])?.slug;
      return json(tradeBySlug(String(slug), origin), 201);
    }

    return error('Method not allowed.', 405);
  }

  const trade = tradeBySlug(identifier, origin);
  if (!trade) return error('Not found.', 404);

  if (request.method === 'GET') return json(trade);

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    const existing = row<Record<string, any>>('SELECT * FROM trades WHERE id = ?', [trade.id])!;
    exec(
      `UPDATE trades SET tagline = ?, summary = ?, description = ?, icon = ?, image = ?,
                         entry_requirements = ?, career_paths = ?, curriculum = ?, is_active = ?,
                         order_index = ?, code = ?
       WHERE id = ?`,
      [
        body.tagline === undefined ? existing.tagline : str(body.tagline),
        body.summary === undefined ? existing.summary : str(body.summary),
        body.description === undefined ? existing.description : str(body.description),
        body.icon === undefined ? existing.icon : str(body.icon),
        body.image === undefined ? existing.image : str(body.image),
        body.entry_requirements === undefined ? existing.entry_requirements : str(body.entry_requirements),
        body.career_paths === undefined ? existing.career_paths : JSON.stringify(body.career_paths),
        body.curriculum === undefined ? existing.curriculum : JSON.stringify(body.curriculum),
        body.is_active === undefined ? existing.is_active : boolValue(body.is_active) === false ? 0 : 1,
        body.order === undefined ? existing.order_index : Number(body.order) || 0,
        body.code === undefined ? existing.code : str(body.code),
        trade.id,
      ]
    );
    const slug = row<{ slug: string }>('SELECT slug FROM trades WHERE id = ?', [trade.id])?.slug;
    return json(tradeBySlug(String(slug), origin));
  }

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    exec('UPDATE teachers SET trade_id = NULL WHERE trade_id = ?', [trade.id]);
    exec('DELETE FROM trades WHERE id = ?', [trade.id]);
    return noContent();
  }

  return error('Method not allowed.', 405);
}

/* ---------------------------------------------------------------- academics */

async function academicRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const [resource, ...rest] = segs;
  const origin = originOf(request);
  const url = new URL(request.url);

  /* ---------------------------------------------------------- departments */
  if (resource === 'departments') {
    if (request.method === 'GET') {
      const list = rows<Record<string, any>>('SELECT * FROM departments ORDER BY id ASC').map(departmentJson);
      return json(paginate(list, url));
    }
    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const created = exec('INSERT INTO departments (name, description) VALUES (?, ?)', [
        str(body.name),
        str(body.description),
      ]);
      return json(
        departmentJson(row('SELECT * FROM departments WHERE id = ?', [created.lastInsertRowid])),
        201
      );
    }
    return error('Method not allowed.', 405);
  }

  /* -------------------------------------------------------------- programs */
  if (resource === 'programs') {
    if (request.method === 'GET') {
      const { sql, params } = filtered(
        `SELECT p.*, d.id AS dept_id, d.name AS dept_name, d.description AS dept_description
         FROM programs p JOIN departments d ON d.id = p.department_id`,
        url,
        { department: 'p.department_id', level: 'p.level' },
        ['p.name', 'p.description']
      );
      const list = rows(sql, params).map((item) => ({
        ...programJson({ ...item, department_id: item.department_id }),
        department_id: item.department_id,
      }));
      return json(paginate(list, url));
    }
    return error('Method not allowed.', 405);
  }

  /* -------------------------------------------------------------- subjects */
  if (resource === 'subjects') {
    if (request.method === 'GET') {
      const { sql, params } = filtered(
        `SELECT s.*, d.id AS dept_id, d.name AS dept_name, d.description AS dept_description,
                p.name AS program_name, p.level AS program_level
         FROM subjects s
         JOIN departments d ON d.id = s.department_id
         JOIN programs p ON p.id = s.program_id`,
        url,
        { department: 's.department_id', program: 's.program_id' },
        ['s.name', 's.code']
      );
      const list = rows(sql, params).map(subjectJson);
      return json(paginate(list, url));
    }
    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const created = exec(
        'INSERT INTO subjects (name, code, department_id, program_id, credits, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          str(body.name),
          str(body.code),
          numberValue(body.department_id) ?? null,
          numberValue(body.program_id) ?? null,
          Number(body.credits) || 1,
          str(body.description),
        ]
      );
      const created_subject = subjectById(Number(created.lastInsertRowid));
      return json(created_subject, 201);
    }
    return error('Method not allowed.', 405);
  }

  /* -------------------------------------------------------------- students */
  if (resource === 'students') return studentRoutes(request, rest, origin, url);

  /* --------------------------------------------------------------- teachers */
  if (resource === 'teachers') return teacherRoute(request, rest);

  /* ----------------------------------------------------------------- trades */
  if (resource === 'trades') return tradeRoutes(request, rest);

  /* ----------------------------------------------------------------- grades */
  if (resource === 'grades') {
    if (rest[0] === 'mine') {
      const auth = requireUser(request);
      if ('response' in auth) return auth.response;
      const student = studentOf(auth.user);
      if (!student) return error('This account has no student profile.', 404);

      const term = url.searchParams.get('term');
      const year = url.searchParams.get('academic_year');
      let sql = `${GRADE_SELECT} WHERE g.student_id = ?`;
      const params: unknown[] = [student.id];
      if (term) {
        sql += ' AND g.term = ?';
        params.push(term);
      }
      if (year) {
        sql += ' AND g.academic_year = ?';
        params.push(year);
      }
      const records = rows(`${sql} ORDER BY g.date_recorded DESC, g.id DESC`, params);
      const percentages = records
        .filter((item) => Number(item.max_score) > 0)
        .map((item) => (Number(item.score) / Number(item.max_score)) * 100);
      const average = percentages.length
        ? Math.round((percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 10) / 10
        : null;
      return json({
        student: {
          id: student.id,
          student_id: student.student_id,
          full_name: [student.first_name, student.last_name].filter(Boolean).join(' '),
          program: student.program_name,
          level: student.program_level,
        },
        results: records.map(gradeJson),
        average,
        count: records.length,
      });
    }

    if (request.method === 'GET') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const { sql, params } = filtered(GRADE_SELECT, url, {
        student: 'g.student_id',
        subject: 'g.subject_id',
        term: 'g.term',
        academic_year: 'g.academic_year',
      });
      const list = rows(`${sql} ORDER BY g.date_recorded DESC, g.id DESC`, params).map(gradeJson);
      return json(paginate(list, url));
    }

    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const studentId = numberValue(body.student_id);
      const subjectId = numberValue(body.subject_id);
      const score = Number(body.score);
      const maxScore = Number(body.max_score) || 100;
      if (!studentId) return json({ student_id: ['This field is required.'] }, 400);
      if (!subjectId) return json({ subject_id: ['This field is required.'] }, 400);
      if (!Number.isFinite(score)) return json({ score: ['A valid number is required.'] }, 400);
      if (score > maxScore) return json({ score: ['Score cannot be greater than the maximum score.'] }, 400);

      const term = str(body.term) || 'Term 1';
      const academicYear = str(body.academic_year) || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      const duplicate = maybeRow(
        `SELECT id FROM grades WHERE student_id = ? AND subject_id = ? AND term = ? AND academic_year = ?`,
        [studentId, subjectId, term, academicYear]
      );
      if (duplicate) {
        return json(
          { non_field_errors: ['A mark for this student, subject and term already exists.'] },
          400
        );
      }

      const teacher = row<{ id: number }>('SELECT id FROM teachers WHERE user_id = ?', [auth.user.id]);
      const created = exec(
        `INSERT INTO grades (student_id, subject_id, teacher_id, score, max_score, term, academic_year)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, subjectId, teacher?.id ?? null, score, maxScore, term, academicYear]
      );
      return json(gradeJson(row(`${GRADE_SELECT} WHERE g.id = ?`, [created.lastInsertRowid])), 201);
    }
    return error('Method not allowed.', 405);
  }

  /* ------------------------------------------------------------- attendance */
  if (resource === 'attendance') {
    if (rest[0] === 'mine') {
      const auth = requireUser(request);
      if ('response' in auth) return auth.response;
      const student = studentOf(auth.user);
      if (!student) return error('This account has no student profile.', 404);

      const records = rows(
        `${ATTENDANCE_SELECT} WHERE a.student_id = ? ORDER BY a.date DESC, a.id DESC`,
        [student.id]
      );
      const counts: Record<string, number> = { present: 0, absent: 0, late: 0, excused: 0 };
      records.forEach((record) => {
        counts[record.status] = (counts[record.status] ?? 0) + 1;
      });
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      const attendanceRate = total
        ? Math.round(((counts.present + counts.late) / total) * 1000) / 10
        : null;
      return json({
        counts,
        total,
        attendance_rate: attendanceRate,
        records: records.slice(0, 30).map(attendanceJson),
      });
    }

    if (request.method === 'GET') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const { sql, params } = filtered(ATTENDANCE_SELECT, url, {
        student: 'a.student_id',
        status: 'a.status',
        date: 'a.date',
        subject: 'a.subject_id',
      });
      const list = rows(`${sql} ORDER BY a.date DESC, a.id DESC`, params).map(attendanceJson);
      return json(paginate(list, url));
    }

    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const studentId = numberValue(body.student_id);
      if (!studentId) return json({ student_id: ['This field is required.'] }, 400);
      const date = str(body.date) || new Date().toISOString().slice(0, 10);
      const status = str(body.status) || 'present';
      const subjectId = numberValue(body.subject_id);

      const duplicate = maybeRow(
        `SELECT id FROM attendance WHERE student_id = ? AND date = ? AND
           ((subject_id IS NULL AND ? IS NULL) OR subject_id = ?)`,
        [studentId, date, subjectId, subjectId]
      );
      if (duplicate) {
        return json({ non_field_errors: ['Attendance for this student on this date already exists.'] }, 400);
      }

      const created = exec(
        `INSERT INTO attendance (student_id, subject_id, date, status, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [studentId, subjectId, date, status, str(body.notes), auth.user.id]
      );
      return json(attendanceJson(row(`${ATTENDANCE_SELECT} WHERE a.id = ?`, [created.lastInsertRowid])), 201);
    }
    return error('Method not allowed.', 405);
  }

  return error('Not found.', 404);
}

/* --------------------------------------------------------------- holidays */

async function holidayRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const [identifier] = segs;

  if (!identifier) {
    if (request.method === 'GET') {
      const { sql, params } = filtered('SELECT * FROM holidays', url, { is_national: 'is_national' });
      const list = rows(`${sql} ORDER BY start_date ASC`, params).map(holidayJson);
      return json(paginate(list, url));
    }
    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      const created = exec(
        'INSERT INTO holidays (name, start_date, end_date, description, is_national) VALUES (?, ?, ?, ?, ?)',
        [
          str(body.name),
          str(body.start_date),
          str(body.end_date),
          str(body.description),
          boolValue(body.is_national) ? 1 : 0,
        ]
      );
      return json(holidayJson(row('SELECT * FROM holidays WHERE id = ?', [created.lastInsertRowid])), 201);
    }
    return error('Method not allowed.', 405);
  }

  const holiday = maybeRow('SELECT * FROM holidays WHERE id = ?', [Number(identifier)]);
  if (!holiday) return error('Not found.', 404);
  if (request.method === 'GET') return json(holidayJson(holiday));
  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    exec('DELETE FROM holidays WHERE id = ?', [holiday.id]);
    return noContent();
  }
  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    exec(
      'UPDATE holidays SET name = ?, start_date = ?, end_date = ?, description = ?, is_national = ? WHERE id = ?',
      [
        body.name === undefined ? holiday.name : str(body.name),
        body.start_date === undefined ? holiday.start_date : str(body.start_date),
        body.end_date === undefined ? holiday.end_date : str(body.end_date),
        body.description === undefined ? holiday.description : str(body.description),
        body.is_national === undefined ? holiday.is_national : boolValue(body.is_national) ? 1 : 0,
        holiday.id,
      ]
    );
    return json(holidayJson(row('SELECT * FROM holidays WHERE id = ?', [holiday.id])));
  }
  return error('Method not allowed.', 405);
}

const RESOURCE_SELECT = `
  SELECT r.*, COALESCE(u.first_name || ' ' || u.last_name, u.username, '') AS uploaded_by_name
  FROM holiday_resources r
  LEFT JOIN users u ON u.id = r.uploaded_by
`;

const RESOURCE_FILTERS: Record<string, string> = {
  class_level: 'r.class_level',
  year: 'r.year',
  term: 'r.term',
  resource_type: 'r.resource_type',
};

function humanSize(bytes: number) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return unit === 0 ? `${Math.round(size)} ${units[unit]}` : `${size.toFixed(1)} ${units[unit]}`;
}

async function resourceRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const origin = originOf(request);
  const [identifier] = segs;

  if (!identifier) {
    if (request.method === 'GET') {
      const auth = requireUser(request);
      const staff = !('response' in auth) && isStaff(auth.user);
      const { sql, params } = filtered(RESOURCE_SELECT, url, RESOURCE_FILTERS, [
        'r.title',
        'r.description',
      ]);
      const clause = staff ? '' : `${sql.includes('WHERE') ? ' AND' : ' WHERE'} r.is_active = 1`;
      const list = rows(`${sql}${clause} ORDER BY r.upload_date DESC, r.id DESC`, params).map((item) =>
        resourceJson(item, origin)
      );
      return json(paginate(list, url));
    }

    if (request.method === 'POST') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;

      const isJson = (request.headers.get('content-type') || '').includes('application/json');
      const form = isJson ? null : await request.formData();
      let fields: Record<string, unknown> = {};
      if (isJson) fields = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const get = (key: string) => {
        if (isJson) return typeof fields[key] === 'string' ? (fields[key] as string) : '';
        const value = form?.get(key);
        return typeof value === 'string' ? value : '';
      };

      let fileUrl: string | null = null;
      let fileSize = '';
      const upload = form?.get('file');
      if (upload && typeof upload === 'object' && 'arrayBuffer' in upload) {
        const blob = upload as File;
        const filename = `${Date.now()}-${slugify(blob.name.replace(/\.[^.]+$/, ''))}${
          path.extname(blob.name) || '.pdf'
        }`;
        const directory = path.join(UPLOAD_DIR, 'holiday-resources');
        fs.mkdirSync(directory, { recursive: true });
        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(path.join(directory, filename), buffer);
        fileUrl = `/uploads/holiday-resources/${filename}`;
        fileSize = humanSize(buffer.byteLength);
      }

      const created = exec(
        `INSERT INTO holiday_resources (title, description, class_level, year, term, resource_type,
                                        file, file_size, uploaded_by, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          get('title'),
          get('description'),
          get('class_level') || 'L3',
          Number(get('year')) || new Date().getFullYear(),
          Number(get('term')) || 1,
          get('resource_type') || 'assignment',
          fileUrl,
          fileSize,
          auth.user.id,
        ]
      );
      const record = row(`${RESOURCE_SELECT} WHERE r.id = ?`, [created.lastInsertRowid]);
      return json(resourceJson(record, origin), 201);
    }
    return error('Method not allowed.', 405);
  }

  const record = maybeRow(`${RESOURCE_SELECT} WHERE r.id = ?`, [Number(identifier)]);
  if (!record) return error('Not found.', 404);

  if (request.method === 'GET') return json(resourceJson(record, origin));

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    if (record.file && String(record.file).startsWith('/uploads/')) {
      const absolute = path.join(process.cwd(), 'public', String(record.file));
      try {
        if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
      } catch {
        /* the row still goes away even if the file was already gone */
      }
    }
    exec('DELETE FROM holiday_resources WHERE id = ?', [record.id]);
    return noContent();
  }

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    exec(
      `UPDATE holiday_resources SET title = ?, description = ?, class_level = ?, year = ?, term = ?,
                                    resource_type = ?, is_active = ?
       WHERE id = ?`,
      [
        body.title === undefined ? record.title : str(body.title),
        body.description === undefined ? record.description : str(body.description),
        body.class_level === undefined ? record.class_level : str(body.class_level),
        body.year === undefined ? record.year : Number(body.year),
        body.term === undefined ? record.term : Number(body.term),
        body.resource_type === undefined ? record.resource_type : str(body.resource_type),
        body.is_active === undefined ? record.is_active : boolValue(body.is_active) === false ? 0 : 1,
        record.id,
      ]
    );
    return json(resourceJson(row(`${RESOURCE_SELECT} WHERE r.id = ?`, [record.id]), origin));
  }
  return error('Method not allowed.', 405);
}

/* --------------------------------------------------------------- admissions */

async function admissionRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const [first] = segs;

  const readApplication = async (): Promise<Record<string, string | null>> => {
    const contentType = request.headers.get('content-type') || '';
    let source: Record<string, unknown> = {};
    if (contentType.includes('application/json')) {
      source = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      source = Object.fromEntries(form.entries()) as Record<string, unknown>;
    }
    const value = (key: string) => {
      const item = source[key];
      return typeof item === 'string' ? item.trim() : '';
    };
    return {
      first_name: value('first_name'),
      last_name: value('last_name'),
      email: value('email'),
      phone: value('phone'),
      date_of_birth: value('date_of_birth') || null,
      gender: value('gender'),
      program: value('program_applied') || value('program'),
      previous_school: value('previous_school'),
      parent_name: value('parent_name'),
      parent_phone: value('parent_phone'),
      address: value('address'),
    };
  };

  const insertApplication = (values: Record<string, string | null>) => {
    const created = exec(
      `INSERT INTO admission_applications (first_name, last_name, email, phone, date_of_birth, gender,
                                           program, previous_school, parent_name, parent_phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        values.first_name,
        values.last_name,
        values.email,
        values.phone,
        values.date_of_birth,
        values.gender,
        values.program,
        values.previous_school,
        values.parent_name,
        values.parent_phone,
        values.address,
      ]
    );
    return row('SELECT * FROM admission_applications WHERE id = ?', [created.lastInsertRowid]);
  };

  if (first === 'applications') {
    if (request.method === 'POST') {
      const values = await readApplication();
      if (!values.first_name || !values.last_name) {
        return json({ first_name: ['First and last name are required.'] }, 400);
      }
      return json(insertApplication(values), 201);
    }
    return error('Method not allowed.', 405);
  }

  if (!first) {
    if (request.method === 'POST') {
      const values = await readApplication();
      return json(insertApplication(values), 201);
    }
    if (request.method === 'GET') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const { sql, params } = filtered('SELECT * FROM admission_applications', url, {
        status: 'status',
      });
      const list = rows(`${sql} ORDER BY created_at DESC, id DESC`, params);
      return json(paginate(list, url));
    }
    return error('Method not allowed.', 405);
  }

  const application = maybeRow('SELECT * FROM admission_applications WHERE id = ?', [Number(first)]);
  if (!application) return error('Not found.', 404);

  if (request.method === 'GET') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    return json(application);
  }

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    exec('UPDATE admission_applications SET status = ? WHERE id = ?', [
      str(body.status) || application.status,
      application.id,
    ]);
    return json(row('SELECT * FROM admission_applications WHERE id = ?', [application.id]));
  }

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    exec('DELETE FROM admission_applications WHERE id = ?', [application.id]);
    return noContent();
  }

  return error('Method not allowed.', 405);
}

/* ------------------------------------------------------------------ contact */

function contactMessageJson(record: Record<string, any>) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone ?? '',
    subject: record.subject,
    message: record.message,
    is_read: record.is_read === 1,
    created_at: record.created_at,
  };
}

function contactInfoJson(record: Record<string, any>) {
  return {
    id: record.id,
    school_name: 'Lycée de Nyanza',
    address: record.address,
    phone: record.phone,
    email: record.email,
    working_hours: record.office_hours,
    office_hours: record.office_hours,
    latitude: null,
    longitude: null,
  };
}

async function contactRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const [section, identifier] = segs;

  if (section === 'messages' && request.method === 'POST') {
    const body = await readJson(request);
    const name = str(body.name);
    const email = str(body.email);
    const message = str(body.message);
    if (!name || !email || !message) {
      return json(
        {
          name: name ? [] : ['This field is required.'],
          email: email ? [] : ['This field is required.'],
          message: message ? [] : ['This field is required.'],
        },
        400
      );
    }
    const created = exec(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, str(body.phone), str(body.subject) || 'Website enquiry', message]
    );
    return json(contactMessageJson(row('SELECT * FROM contact_messages WHERE id = ?', [created.lastInsertRowid])), 201);
  }

  if (section === 'inbox') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;

    if (!identifier) {
      const { sql, params } = filtered('SELECT * FROM contact_messages', url, { is_read: 'is_read' }, [
        'name',
        'email',
        'subject',
      ]);
      const list = rows(`${sql} ORDER BY created_at DESC, id DESC`, params).map(contactMessageJson);
      return json(paginate(list, url));
    }

    const message = maybeRow('SELECT * FROM contact_messages WHERE id = ?', [Number(identifier)]);
    if (!message) return error('Not found.', 404);
    if (request.method === 'GET') return json(contactMessageJson(message));
    if (request.method === 'PATCH' || request.method === 'PUT') {
      const body = await readJson(request);
      exec('UPDATE contact_messages SET is_read = ? WHERE id = ?', [
        body.is_read === undefined ? message.is_read : boolValue(body.is_read) ? 1 : 0,
        message.id,
      ]);
      return json(contactMessageJson(row('SELECT * FROM contact_messages WHERE id = ?', [message.id])));
    }
    return error('Method not allowed.', 405);
  }

  if (section === 'info') {
    if (!identifier) {
      if (request.method === 'GET') {
        const list = rows('SELECT * FROM contact_info ORDER BY id ASC').map(contactInfoJson);
        return json(paginate(list, url));
      }
      if (request.method === 'POST') {
        const auth = requireStaff(request);
        if ('response' in auth) return auth.response;
        const body = await readJson(request);
        const created = exec(
          'INSERT INTO contact_info (address, phone, email, office_hours) VALUES (?, ?, ?, ?)',
          [str(body.address), str(body.phone), str(body.email), str(body.working_hours) || str(body.office_hours)]
        );
        return json(contactInfoJson(row('SELECT * FROM contact_info WHERE id = ?', [created.lastInsertRowid])), 201);
      }
      return error('Method not allowed.', 405);
    }

    const info = maybeRow('SELECT * FROM contact_info WHERE id = ?', [Number(identifier)]);
    if (!info) return error('Not found.', 404);
    if (request.method === 'GET') return json(contactInfoJson(info));
    if (request.method === 'PATCH' || request.method === 'PUT') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      const body = await readJson(request);
      exec('UPDATE contact_info SET address = ?, phone = ?, email = ?, office_hours = ? WHERE id = ?', [
        body.address === undefined ? info.address : str(body.address),
        body.phone === undefined ? info.phone : str(body.phone),
        body.email === undefined ? info.email : str(body.email),
        body.working_hours === undefined && body.office_hours === undefined
          ? info.office_hours
          : str(body.working_hours) || str(body.office_hours),
        info.id,
      ]);
      return json(contactInfoJson(row('SELECT * FROM contact_info WHERE id = ?', [info.id])));
    }
    if (request.method === 'DELETE') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      exec('DELETE FROM contact_info WHERE id = ?', [info.id]);
      return noContent();
    }
    return error('Method not allowed.', 405);
  }

  return error('Not found.', 404);
}

/* -------------------------------------------------------------- campus life */

function campusEventJson(record: Record<string, any>) {
  const author = row<{ name: string }>(
    `SELECT COALESCE(first_name || ' ' || last_name, username) AS name FROM users WHERE id = ?`,
    [record.created_by ?? 0]
  );
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    event_date: record.event_date,
    event_type: record.category,
    category: record.category,
    image: record.image ?? null,
    created_by: author?.name ?? '',
  };
}

function facilityJson(record: Record<string, any>) {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    image: record.image || null,
    capacity: record.capacity,
  };
}

function clubJson(record: Record<string, any>) {
  const advisor = record.advisor_id
    ? row<{ name: string }>(
        `SELECT COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name
         FROM teachers t JOIN users u ON u.id = t.user_id WHERE t.id = ?`,
        [record.advisor_id]
      )
    : undefined;
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    meeting_day: record.meeting_day,
    meeting_schedule: record.meeting_day,
    advisor: advisor?.name ?? null,
  };
}

async function campusLifeRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const [section, identifier] = segs;

  if (section === 'campus-events') {
    if (!identifier) {
      if (request.method === 'GET') {
        const { sql, params } = filtered('SELECT * FROM campus_events', url, { event_type: 'category' }, [
          'title',
          'description',
        ]);
        const list = rows(`${sql} ORDER BY event_date DESC, id DESC`, params).map(campusEventJson);
        return json(paginate(list, url));
      }
      if (request.method === 'POST') {
        const auth = requireStaff(request);
        if ('response' in auth) return auth.response;
        const body = await readJson(request);
        const created = exec(
          'INSERT INTO campus_events (title, description, event_date, category, created_by) VALUES (?, ?, ?, ?, ?)',
          [
            str(body.title),
            str(body.description),
            str(body.event_date),
            str(body.event_type) || str(body.category) || 'social',
            auth.user.id,
          ]
        );
        return json(campusEventJson(row('SELECT * FROM campus_events WHERE id = ?', [created.lastInsertRowid])), 201);
      }
      return error('Method not allowed.', 405);
    }
    const event = maybeRow('SELECT * FROM campus_events WHERE id = ?', [Number(identifier)]);
    if (!event) return error('Not found.', 404);
    if (request.method === 'GET') return json(campusEventJson(event));
    if (request.method === 'DELETE') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      exec('DELETE FROM campus_events WHERE id = ?', [event.id]);
      return noContent();
    }
    return error('Method not allowed.', 405);
  }

  if (section === 'facilities') {
    if (!identifier) {
      if (request.method === 'GET') {
        const { sql, params } = filtered('SELECT * FROM facilities', url, {}, ['name']);
        const list = rows(`${sql} ORDER BY id ASC`, params).map(facilityJson);
        return json(paginate(list, url));
      }
      if (request.method === 'POST') {
        const auth = requireStaff(request);
        if ('response' in auth) return auth.response;
        const body = await readJson(request);
        const created = exec(
          'INSERT INTO facilities (name, description, image, capacity) VALUES (?, ?, ?, ?)',
          [str(body.name), str(body.description), str(body.image), Number(body.capacity) || 0]
        );
        return json(facilityJson(row('SELECT * FROM facilities WHERE id = ?', [created.lastInsertRowid])), 201);
      }
      return error('Method not allowed.', 405);
    }
    const facility = maybeRow('SELECT * FROM facilities WHERE id = ?', [Number(identifier)]);
    if (!facility) return error('Not found.', 404);
    if (request.method === 'GET') return json(facilityJson(facility));
    if (request.method === 'DELETE') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      exec('DELETE FROM facilities WHERE id = ?', [facility.id]);
      return noContent();
    }
    return error('Method not allowed.', 405);
  }

  if (section === 'clubs') {
    if (!identifier) {
      if (request.method === 'GET') {
        const { sql, params } = filtered('SELECT * FROM clubs', url, {}, ['name']);
        const list = rows(`${sql} ORDER BY id ASC`, params).map(clubJson);
        return json(paginate(list, url));
      }
      if (request.method === 'POST') {
        const auth = requireStaff(request);
        if ('response' in auth) return auth.response;
        const body = await readJson(request);
        const created = exec(
          'INSERT INTO clubs (name, description, meeting_day, advisor_id) VALUES (?, ?, ?, ?)',
          [
            str(body.name),
            str(body.description),
            str(body.meeting_day) || str(body.meeting_schedule),
            numberValue(body.advisor_id),
          ]
        );
        return json(clubJson(row('SELECT * FROM clubs WHERE id = ?', [created.lastInsertRowid])), 201);
      }
      return error('Method not allowed.', 405);
    }
    const club = maybeRow('SELECT * FROM clubs WHERE id = ?', [Number(identifier)]);
    if (!club) return error('Not found.', 404);
    if (request.method === 'GET') return json(clubJson(club));
    if (request.method === 'DELETE') {
      const auth = requireStaff(request);
      if ('response' in auth) return auth.response;
      exec('DELETE FROM clubs WHERE id = ?', [club.id]);
      return noContent();
    }
    return error('Method not allowed.', 405);
  }

  return error('Not found.', 404);
}

/* --------------------------------------------------------------------- news */

const NEWS_SELECT = `
  SELECT n.*, COALESCE(u.first_name || ' ' || u.last_name, u.username, '') AS author_name
  FROM news_articles n
  LEFT JOIN users u ON u.id = n.author_id
`;

async function newsRoutes(request: NextRequest, segs: string[]): Promise<Response> {
  const url = new URL(request.url);
  const [first] = segs;

  if (first === 'published' || !first) {
    if (request.method !== 'GET') return error('Method not allowed.', 405);
    const auth = requireUser(request);
    const staff = !('response' in auth) && isStaff(auth.user);
    const { sql, params } = filtered(
      NEWS_SELECT,
      url,
      first === 'published' ? { category: 'n.category' } : { category: 'n.category', is_published: 'n.is_published' },
      ['n.title', 'n.content']
    );
    const clause = staff && first !== 'published' ? '' : `${sql.includes('WHERE') ? ' AND' : ' WHERE'} n.is_published = 1`;
    const list = rows(`${sql}${clause} ORDER BY n.published_date DESC, n.id DESC`, params).map(newsJson);
    return json(paginate(list, url));
  }

  const article = maybeRow(`${NEWS_SELECT} WHERE n.id = ? OR n.slug = ?`, [Number(first), first]);
  if (!article) return error('Not found.', 404);
  if (request.method === 'GET') return json(newsJson(article));

  if (request.method === 'PATCH' || request.method === 'PUT') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    exec(
      `UPDATE news_articles SET title = ?, content = ?, excerpt = ?, category = ?, is_published = ?,
                                image = ?, published_date = ?
       WHERE id = ?`,
      [
        body.title === undefined ? article.title : str(body.title),
        body.content === undefined ? article.content : str(body.content),
        body.excerpt === undefined ? article.excerpt : str(body.excerpt),
        body.category === undefined ? article.category : str(body.category),
        body.is_published === undefined ? article.is_published : boolValue(body.is_published) ? 1 : 0,
        body.image === undefined ? article.image : str(body.image),
        body.published_date === undefined ? article.published_date : str(body.published_date),
        article.id,
      ]
    );
    return json(newsJson(row(`${NEWS_SELECT} WHERE n.id = ?`, [article.id])));
  }

  if (request.method === 'DELETE') {
    const auth = requireStaff(request);
    if ('response' in auth) return auth.response;
    exec('DELETE FROM news_articles WHERE id = ?', [article.id]);
    return noContent();
  }

  return error('Method not allowed.', 405);
}

/* ------------------------------------------------------- supabase identity */

/**
 * Maps a verified Supabase identity onto a row in this database. Existing
 * accounts are matched by Supabase id, then by e-mail, then by the contact
 * address on a teacher profile. Anything else becomes a new student account
 * that an administrator can promote from the dashboard.
 */
function resolveSupabaseUser(uid: string, email: string, fullName = ''): UserRow | null {
  const byUid = maybeRow<UserRow>('SELECT * FROM users WHERE supabase_uid = ?', [uid]);
  if (byUid) return byUid;

  if (email) {
    const byEmail = maybeRow<UserRow>('SELECT * FROM users WHERE lower(email) = lower(?)', [email]);
    if (byEmail) return byEmail;

    const byTeacherEmail = maybeRow<UserRow>(
      `SELECT u.* FROM teachers t JOIN users u ON u.id = t.user_id
       WHERE lower(t.email) = lower(?)`,
      [email]
    );
    if (byTeacherEmail) return byTeacherEmail;
  }

  const [first, ...restParts] = (fullName || email.split('@')[0] || 'New').split(/\s+/);
  const last = restParts.join(' ');
  const base = slugify(last ? `${first}.${last}` : first);
  let username = base;
  let counter = 1;
  while (maybeRow('SELECT id FROM users WHERE username = ?', [username])) {
    counter += 1;
    username = `${base}${counter}`;
  }

  const created = exec(
    `INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, supabase_uid)
     VALUES (?, ?, ?, ?, ?, 'student', 0, ?)`,
    [username, email, hashPassword(crypto.randomUUID()), first, last, uid]
  );
  return maybeRow<UserRow>('SELECT * FROM users WHERE id = ?', [created.lastInsertRowid]) ?? null;
}

/* ---------------------------------------------------------------- settings */

async function settingsRoutes(request: NextRequest): Promise<Response> {
  const auth = requireStaff(request);
  if ('response' in auth) return auth.response;

  if (request.method === 'GET') {
    const stored = rows<{ key: string; value: string }>('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    stored.forEach((item) => {
      settings[item.key] = item.value;
    });
    return json({
      imgdb_endpoint: settings.imgdb_endpoint || 'https://api.imgbb.com/1/upload',
      imgdb_api_key: settings.imgdb_api_key || '',
      supabase_url: SUPABASE_URL,
    });
  }

  if (request.method === 'PUT' || request.method === 'PATCH') {
    if (!canManageStaff(auth.user)) {
      return error('Only the head teacher or director of studies can change settings.', 403);
    }
    const body = await readJson(request);
    for (const key of ['imgdb_endpoint', 'imgdb_api_key']) {
      if (body[key] === undefined) continue;
      exec(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, str(body[key])]
      );
    }
    return json({ ok: true });
  }

  return error('Method not allowed.', 405);
}

/* ---------------------------------------------------------------- dispatch */

async function handle(request: NextRequest, ctx: Ctx): Promise<Response> {
  ensureSeeded();

  const segs = (ctx.params?.path ?? []).filter(Boolean);
  const [head, ...rest] = segs;

  try {
    if (!head) {
      return json({
        message: 'Lycée de Nyanza API is running',
        endpoints: {
          auth: '/api/auth/',
          academics: '/api/academics/',
          holidays: '/api/holidays/',
          holiday_resources: '/api/holiday-resources/',
          admissions: '/api/admissions/',
          campus_life: '/api/campus-life/',
          news: '/api/news/',
          contact: '/api/contact/',
        },
      });
    }

    if (head === 'auth') return await authRoutes(request, rest);
    if (head === 'academics') return await academicRoutes(request, rest);
    if (head === 'holidays') return await holidayRoutes(request, rest);
    if (head === 'holiday-resources') return await resourceRoutes(request, rest);
    if (head === 'admissions') return await admissionRoutes(request, rest);
    if (head === 'contact') return await contactRoutes(request, rest);
    if (head === 'campus-life') return await campusLifeRoutes(request, rest);
    if (head === 'news') return await newsRoutes(request, rest);
    if (head === 'settings') return await settingsRoutes(request);

    return error('Not found.', 404);
  } catch (err) {
    console.error('[api] request failed', request.method, request.nextUrl.pathname, err);
    const message = err instanceof Error ? err.message : 'Unexpected server error.';
    return error(message, 500);
  }
}

export function GET(request: NextRequest, ctx: Ctx) {
  return handle(request, ctx);
}

export function POST(request: NextRequest, ctx: Ctx) {
  return handle(request, ctx);
}

export function PUT(request: NextRequest, ctx: Ctx) {
  return handle(request, ctx);
}

export function PATCH(request: NextRequest, ctx: Ctx) {
  return handle(request, ctx);
}

export function DELETE(request: NextRequest, ctx: Ctx) {
  return handle(request, ctx);
}
