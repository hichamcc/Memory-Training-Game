import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { tactics } from '@/lib/tactics';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/daily`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...tactics.flatMap((tactic) => [
      { url: `${SITE_URL}/tactics/${tactic.id}`, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${SITE_URL}/tactics/${tactic.id}/practice`, changeFrequency: 'monthly' as const, priority: 0.6 },
    ]),
  ];
}
