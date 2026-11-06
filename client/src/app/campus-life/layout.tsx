import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'Campus Life, Boarding & Student Activities';
const description =
  'Discover life at Lycée de Nyanza: boarding facilities, clubs, sports, spiritual life and modern laboratories that make our campus a supportive place to learn and grow.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/campus-life',
  keywords: [
    'Lycée de Nyanza campus life',
    'boarding school Rwanda',
    'student clubs Nyanza',
    'school sports Rwanda',
  ],
});

export default function CampusLifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: '/campus-life' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Campus Life', path: '/campus-life' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
