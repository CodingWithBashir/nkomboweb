import tradesSeed from '@/data/trades.json';

/**
 * Public content layer.
 *
 * The Django API is the source of truth (the admin dashboard writes to it), but
 * every page must still render when the API is unreachable — at build time on a
 * CI machine, for example. Each getter therefore falls back to the bundled
 * snapshot in `src/data/trades.json`, which mirrors the seeded content.
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

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(
  /\/$/,
  ''
);

/** Seconds before Next regenerates a page built from API data. */
export const REVALIDATE = 600;

const seedTrades = (tradesSeed as unknown as Trade[]).filter((trade) => trade.is_active);

async function fetchJson<T>(path: string, timeoutMs = 2500): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE },
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Trades ordered the way the school lists them, HOD first on each team. */
export async function getTrades(): Promise<Trade[]> {
  const data = await fetchJson<{ results?: Trade[] } | Trade[]>(
    '/academics/trades/?page_size=100'
  );
  const list = Array.isArray(data) ? data : data?.results;
  const trades = (list ?? []).filter((trade) => trade.is_active !== false);
  return (trades.length ? trades : seedTrades)
    .map((trade) => ({ ...trade, teachers: sortTeam(trade.teachers ?? []) }))
    .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
}

export async function getTrade(slug: string): Promise<Trade | null> {
  const data = await fetchJson<Trade>(`/academics/trades/${slug}/`);
  if (data && data.slug) {
    return { ...data, teachers: sortTeam(data.teachers ?? []) };
  }
  const local = seedTrades.find((trade) => trade.slug === slug);
  return local ? { ...local, teachers: sortTeam(local.teachers ?? []) } : null;
}

export async function getTeachers(): Promise<Teacher[]> {
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
