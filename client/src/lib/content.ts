import tradesSeed from '@/data/trades.json';
import {
  allTrades,
  publicStudents,
  tradeBySlug,
  teachers as allTeacherRows,
} from './server/queries';
import { seedDatabase } from './server/seed';

/**
 * Public content layer (server components only).
 *
 * Reads the SQLite database that backs the school API — the same store the
 * admin dashboard writes to — and falls back to the bundled snapshot in
 * `src/data/trades.json` if the database is not available (for example on a
 * machine where the seed never ran).
 */

export type CurriculumLevel = {
  level: string;
  title: string;
  modules: string[];
};

export type Teacher = {
  id: number;
  user: string;
  full_name: string;
  initials: string;
  email: string;
  phone: string;
  employee_id: string;
  title: string;
  is_hod: boolean;
  slug: string;
  qualification: string;
  hire_date: string;
  bio: string;
  levels: string;
  classes: string;
  years_experience: number;
  photo: string | null;
  photo_url: string | null;
  is_public: boolean;
  order: number;
  department: { id: number; name: string; description?: string } | null;
  trade: { id: number; slug: string; code: string; name: string; tagline: string } | null;
};

export type Trade = {
  id: number;
  slug: string;
  code: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  icon: string;
  image: string;
  entry_requirements: string;
  career_paths: string[];
  curriculum: CurriculumLevel[];
  is_active: boolean;
  order: number;
  department: string;
  teachers: Teacher[];
  teacher_count: number;
};

/** How long a page built from this content stays fresh before it is re-rendered. */
export const REVALIDATE = 600;

const seedTrades = (tradesSeed as unknown as Trade[]).filter((trade) => trade.is_active);

let databaseReady = false;

/** First read in the process creates and seeds the SQLite database. */
function ensureDatabase() {
  if (databaseReady) return;
  try {
    seedDatabase();
    databaseReady = true;
  } catch (err) {
    console.warn('[content] database unavailable, using the bundled snapshot', err);
  }
}

function normalize(trade: Trade): Trade {
  return { ...trade, teachers: sortTeam(trade.teachers ?? []) };
}

/** Trades ordered the way the school lists them, HOD first on each team. */
export async function getTrades(): Promise<Trade[]> {
  ensureDatabase();
  try {
    const trades = (allTrades('') as unknown as Trade[]).filter((trade) => trade.is_active !== false);
    if (trades.length) {
      return trades.map(normalize).sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
    }
  } catch (err) {
    console.warn('[content] falling back to the bundled trade snapshot', err);
  }
  return seedTrades
    .map(normalize)
    .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
}

export async function getTrade(slug: string): Promise<Trade | null> {
  try {
    const trade = tradeBySlug(slug, '') as unknown as Trade | null;
    if (trade) return normalize(trade);
  } catch (err) {
    console.warn('[content] falling back to the bundled trade snapshot', err);
  }
  const local = seedTrades.find((trade) => trade.slug === slug);
  return local ? normalize(local) : null;
}

export async function getTeachers(): Promise<Teacher[]> {
  ensureDatabase();
  try {
    const rows = allTeacherRows('') as unknown as Teacher[];
    if (rows.length) {
      return rows.filter((teacher) => teacher.is_public !== false);
    }
  } catch (err) {
    console.warn('[content] falling back to the bundled teacher snapshot', err);
  }
  const trades = await getTrades();
  return trades.flatMap((trade) => trade.teachers.map((t) => ({ ...t, trade: t.trade ?? trade })));
}

export async function getTeacher(slug: string): Promise<Teacher | null> {
  const teachers = await getTeachers();
  return teachers.find((teacher) => teacher.slug === slug) ?? null;
}

export function sortTeam(teachers: Teacher[]): Teacher[] {
  return [...teachers]
    .filter((teacher) => teacher.is_public !== false)
    .sort(
      (a, b) =>
        Number(b.is_hod) - Number(a.is_hod) ||
        (a.order ?? 0) - (b.order ?? 0) ||
        a.full_name.localeCompare(b.full_name)
    );
}

export function splitTeam(teachers: Teacher[]): { hod: Teacher | null; trainers: Teacher[] } {
  const team = sortTeam(teachers);
  const hod = team.find((teacher) => teacher.is_hod) ?? null;
  return { hod, trainers: team.filter((teacher) => teacher !== hod) };
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'T'
  );
}

export type Student = {
  id: number;
  student_id: string;
  full_name: string;
  initials?: string;
  gender?: string;
  level: string;
  promotion_year: number;
  photo_url: string | null;
  trade: { id: number; slug: string; code: string; name: string } | null;
};

export async function getStudents(tradeSlug?: string): Promise<Student[]> {
  ensureDatabase();
  try {
    return publicStudents('', tradeSlug ? { trade: tradeSlug } : {}) as unknown as Student[];
  } catch (err) {
    console.warn('[content] students unavailable', err);
    return [];
  }
}

/** Lucide icon keys used by the trades, mapped to component names. */
export const TRADE_ICON_KEYS = [
  'code',
  'network',
  'monitor',
  'video',
  'car',
  'zap',
  'building',
  'radio',
  'briefcase',
  'utensils',
] as const;
