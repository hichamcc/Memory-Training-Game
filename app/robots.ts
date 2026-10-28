import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Open to all crawlers, including AI search bots (GPTBot, ClaudeBot,
// PerplexityBot, Google-Extended), so the guides can be cited in AI answers
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
