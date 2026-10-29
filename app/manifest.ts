import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/games',
    scope: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#2563eb',
    categories: ['education', 'games'],
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Daily challenge', url: '/daily' },
      { name: 'All games', url: '/games' },
    ],
  };
}
