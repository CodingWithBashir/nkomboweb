import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'Admissions & How to Apply';
const description =
  'Apply to Lycée de Nyanza for the 2025–2026 academic year. Admission requirements, application steps, required documents, fees and key dates for our technical secondary programs.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/admissions',
  keywords: [
    'Lycée de Nyanza admissions',
    'school admission Rwanda',
    'apply technical secondary school Rwanda',
    'admission requirements Nyanza',
    'school fees Rwanda TVET',
  ],
});

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: '/admissions' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Admissions', path: '/admissions' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
