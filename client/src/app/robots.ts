import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/school';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/login', '/forgot-password', '/reset-password', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/about', '/academics', '/admissions'],
        disallow: ['/dashboard/', '/login', '/forgot-password', '/reset-password', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
