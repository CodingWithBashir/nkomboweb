import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/school';
import { getTrades } from '@/lib/content';

export const revalidate = 3600;

const LAST_REVIEWED = new Date('2026-11-06');

const routes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/academics', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/teachers', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/admissions', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/campus-life', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/holidays', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trades = await getTrades();

  const tradeEntries: MetadataRoute.Sitemap = trades.map((trade) => ({
    url: `${SITE_URL}/academics/${trade.slug}`,
    lastModified: LAST_REVIEWED,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const teacherEntries: MetadataRoute.Sitemap = trades.flatMap((trade) =>
    trade.teachers.map((teacher) => ({
      url: `${SITE_URL}/teachers/${teacher.slug}`,
      lastModified: LAST_REVIEWED,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))
  );

  const staticEntries: MetadataRoute.Sitemap = routes.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: LAST_REVIEWED,
      changeFrequency,
      priority,
    })
  );

  return [...staticEntries, ...tradeEntries, ...teacherEntries];
}
