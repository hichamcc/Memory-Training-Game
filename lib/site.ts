export const SITE_NAME = 'Memory Champions';

export const SITE_DESCRIPTION =
  'Learn the memory techniques used by memory champions (memory palace, Major System, PAO, peg system and more) and practice them with quick games.';

// Absolute site URL for canonical links, the sitemap and structured data.
// NEXT_PUBLIC_SITE_URL wins (set it for a custom domain); otherwise Vercel's
// production domain, which Vercel provides automatically at build time.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '');

export const AUTHOR = {
  name: 'codebyhicham',
  url: 'https://www.codebyhicham.com',
};

// The full home page title; other pages get "<page> - Memory Champions"
export const SITE_TITLE = `${SITE_NAME}: Free Memory Training Games & Techniques`;

// Other ways people write the name, so searches for them still find the site
export const SITE_ALTERNATE_NAMES = ['MemoryChampions', 'Memory Champions app', 'Memory Champions game'];

// The share card from app/opengraph-image.tsx. Pages that set their own
// openGraph replace the parent's, so they need to list it again.
export const SHARE_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME}: free memory training games and techniques` };
