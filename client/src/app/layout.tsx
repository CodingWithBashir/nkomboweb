import type { Metadata, Viewport } from 'next';
import './globals.css';
import JsonLd from '@/components/JsonLd';
import { SCHOOL, SITE_URL } from '@/lib/school';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  KEYWORDS,
  OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SCHOOL.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SCHOOL.name,
  authors: [{ name: SCHOOL.name, url: SITE_URL }],
  creator: SCHOOL.name,
  publisher: SCHOOL.name,
  category: 'education',
  classification: 'Education, Secondary School, TVET',
  alternates: {
    canonical: '/',
    languages: { 'en-RW': SITE_URL, en: SITE_URL },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_RW',
    url: SITE_URL,
    siteName: SCHOOL.name,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lyceedenyanza',
    creator: '@lyceedenyanza',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  appleWebApp: {
    capable: true,
    title: SCHOOL.name,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: true, address: true, email: true },
  other: {
    'geo.region': 'RW-05',
    'geo.placename': 'Nyanza, Southern Province, Rwanda',
    'geo.position': `${SCHOOL.geo.lat};${SCHOOL.geo.lng}`,
    ICBM: `${SCHOOL.geo.lat}, ${SCHOOL.geo.lng}`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a2540' },
    { media: '(prefers-color-scheme: dark)', color: '#0a2540' },
  ],
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-RW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" hrefLang="en-rw" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to main content
        </a>
        {children}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
