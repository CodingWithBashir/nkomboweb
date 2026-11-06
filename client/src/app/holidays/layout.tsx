import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'Holiday Assignments & Revision Resources';
const description =
  'Download holiday assignments, revision notes and study guides for L3, L4 and L5 classes at Lycée de Nyanza. Filter resources by class, academic year, term and type.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/holidays',
  keywords: [
    'Lycée de Nyanza holiday assignments',
    'holiday revision notes Rwanda',
    'L3 L4 L5 study guides',
    'school holiday resources download',
  ],
});

export default function HolidaysLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: '/holidays' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Holidays', path: '/holidays' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
