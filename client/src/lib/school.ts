/**
 * Single source of truth for the school's public details.
 * Plain data only — safe to import from both server and client components.
 */

export const SCHOOL = {
  name: 'Lycée de Nyanza',
  legalName: 'Lycée de Nyanza Technical Secondary School',
  shortName: 'Lycée de Nyanza',
  tagline: 'Excellence Through Discipline',
  type: 'Private boarding technical secondary school (TVET)',
  phone: '+250 788 123 456',
  phoneAlt: '+250 788 123 457',
  email: 'info@lyceedenyanza.rw',
  admissionsEmail: 'admissions@lyceedenyanza.rw',
  location: 'Nyanza District, Southern Province - Rwanda',
  shortLocation: 'Nyanza, Rwanda',
  street: 'Nyanza District',
  city: 'Nyanza',
  region: 'Southern Province',
  country: 'RW',
  countryName: 'Rwanda',
  postalCode: '00000',
  geo: { lat: -2.3514, lng: 29.7511 },
  founded: '2005',
  socials: {
    facebook: 'https://facebook.com/lyceedenyanza',
    youtube: 'https://youtube.com/@lyceedenyanza',
    linkedin: 'https://linkedin.com/company/lyceedenyanza',
  },
  programs: [
    'Software Development',
    'Networking & Internet Technology',
    'Multimedia Production',
    'Computer System & Architecture',
    'Automobile Technology',
    'Building Construction',
    'Electrical Technology',
    'Tourism',
    'Food & Beverage Operations',
    'Electronics & Telecommunications',
  ],
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lyceedenyanza.rw'
).replace(/\/$/, '');

export const absoluteUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
