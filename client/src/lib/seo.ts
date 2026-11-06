import type { Metadata } from 'next';
import { SCHOOL, SITE_URL, absoluteUrl } from './school';

export const DEFAULT_TITLE =
  'Lycée de Nyanza | Technical Secondary School in Nyanza, Rwanda';
export const DEFAULT_DESCRIPTION =
  'Lycée de Nyanza is a private boarding technical secondary school in Nyanza District, Southern Province, Rwanda, offering career-focused TVET programs in software development, networking, multimedia, electrical and automobile technology.';
export const OG_IMAGE = {
  url: '/og-cover.png',
  width: 1200,
  height: 630,
  alt: 'Lycée de Nyanza — Building Skills. Shaping Tomorrow.',
};

export const KEYWORDS = [
  'Lycée de Nyanza',
  'Lycee de Nyanza',
  'technical secondary school Rwanda',
  'TVET school Nyanza',
  'boarding school Nyanza District',
  'best secondary school Southern Province Rwanda',
  'software development course Rwanda',
  'networking and internet technology Rwanda',
  'multimedia production studies Rwanda',
  'automobile technology school Rwanda',
  'building construction TVET Rwanda',
  'electrical technology Rwanda',
  'school admissions Rwanda 2025',
  'holiday assignments Rwanda',
  'Excellence Through Discipline',
];

type PageMetaOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
};

/**
 * Builds a complete, canonical-aware Metadata object for a page.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  noindex = false,
}: PageMetaOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image
    ? { url: image, width: 1200, height: 630, alt: title }
    : OG_IMAGE;

  return {
    title,
    description,
    keywords: [...keywords, ...KEYWORDS],
    alternates: { canonical: path },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : {
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
      url,
      siteName: SCHOOL.name,
      locale: 'en_RW',
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}

/* ----------------------------- JSON-LD helpers ----------------------------- */

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'School',
    '@id': `${SITE_URL}/#school`,
    name: SCHOOL.name,
    legalName: SCHOOL.legalName,
    alternateName: ['Lycee de Nyanza', 'LDN Nyanza'],
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl('/icon.svg'),
    image: absoluteUrl(OG_IMAGE.url),
    telephone: SCHOOL.phone,
    email: SCHOOL.email,
    foundingDate: SCHOOL.founded,
    slogan: SCHOOL.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SCHOOL.street,
      addressLocality: SCHOOL.city,
      addressRegion: SCHOOL.region,
      postalCode: SCHOOL.postalCode,
      addressCountry: SCHOOL.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SCHOOL.geo.lat,
      longitude: SCHOOL.geo.lng,
    },
    areaServed: { '@type': 'Country', name: SCHOOL.countryName },
    sameAs: [SCHOOL.socials.facebook, SCHOOL.socials.youtube, SCHOOL.socials.linkedin],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SCHOOL.phone,
        contactType: 'admissions',
        email: SCHOOL.admissionsEmail,
        areaServed: SCHOOL.country,
        availableLanguage: ['en', 'rw', 'fr'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Academic and TVET programs',
      itemListElement: SCHOOL.programs.map((program) => ({
        '@type': 'Course',
        name: program,
        provider: { '@id': `${SITE_URL}/#school` },
      })),
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SCHOOL.name,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#school` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#school` },
    inLanguage: 'en',
  };
}
