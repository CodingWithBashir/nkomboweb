import fs from 'node:fs';
import path from 'node:path';
import { SqliteDatabase } from './sqlite';

/**
 * SQLite database for the school API (Node/Next.js).
 *
 * The file lives in `client/data/school.db` and is created, migrated and seeded
 * on first use, so a fresh checkout only needs `npm run dev`.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.SCHOOL_DB_PATH || path.join(DATA_DIR, 'school.db');

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

type GlobalWithDb = typeof globalThis & { __schoolDb?: SqliteDatabase };

function createConnection(): SqliteDatabase {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new SqliteDatabase(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student',
  is_staff INTEGER NOT NULL DEFAULT 0,
  approval TEXT NOT NULL DEFAULT 'approved',
  approved_at TEXT,
  approved_by TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT,
  supabase_uid TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tokens (
  key TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  head_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  level TEXT NOT NULL DEFAULT 'secondary',
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  slug TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'code',
  image TEXT NOT NULL DEFAULT '',
  entry_requirements TEXT NOT NULL DEFAULT '',
  career_paths TEXT NOT NULL DEFAULT '[]',
  curriculum TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  employee_id TEXT UNIQUE NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  qualification TEXT NOT NULL DEFAULT '',
  hire_date TEXT NOT NULL DEFAULT (date('now')),
  trade_id INTEGER REFERENCES trades(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Trainer',
  is_hod INTEGER NOT NULL DEFAULT 0,
  photo TEXT,
  bio TEXT NOT NULL DEFAULT '',
  levels TEXT NOT NULL DEFAULT '',
  classes TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  years_experience INTEGER NOT NULL DEFAULT 0,
  is_public INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  student_id TEXT UNIQUE NOT NULL,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  enrollment_date TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'M',
  parent_name TEXT NOT NULL DEFAULT '',
  parent_phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'L3',
  promotion_year INTEGER NOT NULL DEFAULT 0,
  photo TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  credits INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  subject_id INTEGER NOT NULL REFERENCES subjects(id),
  teacher_id INTEGER REFERENCES teachers(id),
  score REAL NOT NULL,
  max_score REAL NOT NULL DEFAULT 100,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  date_recorded TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  subject_id INTEGER REFERENCES subjects(id),
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  notes TEXT NOT NULL DEFAULT '',
  recorded_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_national INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS holiday_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  class_level TEXT NOT NULL DEFAULT 'L3',
  year INTEGER NOT NULL,
  term INTEGER NOT NULL DEFAULT 1,
  resource_type TEXT NOT NULL DEFAULT 'assignment',
  file TEXT,
  file_size TEXT NOT NULL DEFAULT '',
  uploaded_by INTEGER REFERENCES users(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  upload_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  author_id INTEGER REFERENCES users(id),
  category TEXT NOT NULL DEFAULT 'news',
  image TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  published_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  meeting_day TEXT NOT NULL DEFAULT '',
  advisor_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS campus_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'social',
  image TEXT,
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  office_hours TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'info',
  reference TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'in-app',
  delivered INTEGER NOT NULL DEFAULT 0,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  html TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'info',
  reference TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'none',
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT NOT NULL DEFAULT '',
  attempts INTEGER NOT NULL DEFAULT 0,
  notification_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT,
  gender TEXT NOT NULL DEFAULT '',
  program TEXT NOT NULL DEFAULT '',
  previous_school TEXT NOT NULL DEFAULT '',
  parent_name TEXT NOT NULL DEFAULT '',
  parent_phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reference TEXT,
  trade_id INTEGER,
  level TEXT NOT NULL DEFAULT 'L3',
  message TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  reviewed_at TEXT,
  reviewed_by TEXT NOT NULL DEFAULT '',
  student_id INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/** Columns added after the first release; applied to existing databases. */
const ADDED_COLUMNS: [string, string, string][] = [
  ['users', 'supabase_uid', 'TEXT'],
  ['users', 'approval', "TEXT NOT NULL DEFAULT 'approved'"],
  ['notifications', 'reference', "TEXT NOT NULL DEFAULT ''"],
  ['users', 'approved_at', 'TEXT'],
  ['users', 'approved_by', "TEXT NOT NULL DEFAULT ''"],
  ['users', 'decision_note', "TEXT NOT NULL DEFAULT ''"],
  ['students', 'level', "TEXT NOT NULL DEFAULT 'L3'"],
  ['students', 'promotion_year', 'INTEGER NOT NULL DEFAULT 0'],
  ['students', 'photo', 'TEXT'],
  ['students', 'is_public', 'INTEGER NOT NULL DEFAULT 1'],
  ['teachers', 'photo', 'TEXT'],
  ['admission_applications', 'reference', 'TEXT'],
  ['admission_applications', 'trade_id', 'INTEGER'],
  ['admission_applications', 'level', "TEXT NOT NULL DEFAULT 'L3'"],
  ['admission_applications', 'message', "TEXT NOT NULL DEFAULT ''"],
  ['admission_applications', 'notes', "TEXT NOT NULL DEFAULT ''"],
  ['admission_applications', 'reviewed_at', 'TEXT'],
  ['admission_applications', 'reviewed_by', "TEXT NOT NULL DEFAULT ''"],
  ['admission_applications', 'student_id', 'INTEGER'],
  ['admission_applications', 'updated_at', 'TEXT'],
];

function hasColumn(db: SqliteDatabase, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((row) => row.name === column);
}

function migrate(db: SqliteDatabase) {
  db.exec(SCHEMA);
  for (const [table, column, definition] of ADDED_COLUMNS) {
    if (!hasColumn(db, table, column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_supabase_uid ON users(supabase_uid) WHERE supabase_uid IS NOT NULL');
  db.exec('CREATE INDEX IF NOT EXISTS students_program ON students(program_id)');
  db.exec('CREATE INDEX IF NOT EXISTS applications_status ON admission_applications(status)');
  db.exec('CREATE INDEX IF NOT EXISTS users_approval ON users(approval)');
  db.exec('CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS outbox_status ON outbox(status)');
  db.exec('CREATE INDEX IF NOT EXISTS outbox_email ON outbox(to_email)');
  db.exec('CREATE INDEX IF NOT EXISTS password_resets_user ON password_resets(user_id)');
}

export function getDb(): SqliteDatabase {
  const globalRef = globalThis as GlobalWithDb;
  if (!globalRef.__schoolDb) {
    globalRef.__schoolDb = createConnection();
  }
  return globalRef.__schoolDb;
}

export function resetDb() {
  const globalRef = globalThis as GlobalWithDb;
  if (globalRef.__schoolDb) {
    globalRef.__schoolDb.close();
    globalRef.__schoolDb = undefined;
  }
  if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);
  return getDb();
}

export const DB_FILE = DB_PATH;
