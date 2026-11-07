import type { MetadataRoute } from 'next';
import { SCHOOL } from '@/lib/school';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    short_name: 'Lycée Nyanza',
    description:
      'Official website of Lycée de Nyanza, a technical secondary school in Nyanza District, Southern Province, Rwanda.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    lang: 'en-RW',
    categories: ['education', 'school'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
