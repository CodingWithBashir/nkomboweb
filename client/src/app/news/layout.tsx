import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'News & Events';
const description =
  'Read the latest news, announcements and upcoming events from Lycée de Nyanza — admissions updates, academic results, sports and school community stories.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/news',
  keywords: [
    'Lycée de Nyanza news',
    'school events Rwanda',
    'Nyanza school announcements',
  ],
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: '/news' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'News & Events', path: '/news' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
