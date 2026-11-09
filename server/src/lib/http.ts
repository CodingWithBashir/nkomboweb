/**
 * Small response helpers. Everything is a standard web `Response`, so the same
 * handler runs behind Express (server/) and behind Next.js route handlers.
 */

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

/** 204 response with no body (DRF returns this after a delete). */
export function noContent() {
  return new Response(null, { status: 204 });
}

export function error(detail: string, status = 400) {
  return json({ detail }, status);
}

/** DRF-style pagination envelope, understood by every page in the app. */
export function paginate<T>(rows: T[], url: URL) {
  const pageSize = Math.min(Number(url.searchParams.get('page_size') || 50) || 50, 500);
  const page = Math.max(Number(url.searchParams.get('page') || 1) || 1, 1);
  const start = (page - 1) * pageSize;
  const results = rows.slice(start, start + pageSize);
  const hasNext = start + pageSize < rows.length;
  const next = hasNext
    ? `${url.pathname}?${new URLSearchParams({ ...Object.fromEntries(url.searchParams), page: String(page + 1) })}`
    : null;
  return { count: rows.length, next, previous: null, results };
}

export function sortedBy<T>(rows: T[], compare: (a: T, b: T) => number) {
  return [...rows].sort(compare);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return (await request.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (contentType.includes('multipart/form-data') || contentType.includes('urlencoded')) {
    const form = await request.formData();
    return Object.fromEntries(form.entries()) as Record<string, unknown>;
  }
  return {};
}

export function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function intList(value: unknown, fallback: number[] = []): number[] {
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter(Number.isFinite);
  if (typeof value === 'string' && value.trim()) return value.split(',').map(Number).filter(Number.isFinite);
  return fallback;
}
