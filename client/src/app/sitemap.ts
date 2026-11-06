import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/school';

const LAST_REVIEWED = new Date('2026-11-06');

const routes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/academics', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/admissions', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/campus-life', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/holidays', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_REVIEWED,
    changeFrequency,
    priority,
  }));
}
