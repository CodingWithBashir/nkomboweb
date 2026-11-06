import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo';

const title = 'Contact Us & Visit Our Campus';
const description =
  'Contact Lycée de Nyanza in Nyanza District, Southern Province, Rwanda. Call +250 788 123 456, email info@lyceedenyanza.rw or send us a message to plan your visit.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/contact',
  keywords: [
    'Lycée de Nyanza contact',
    'school phone number Nyanza',
    'Nyanza District school address',
    'visit school Rwanda',
  ],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: '/contact' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
