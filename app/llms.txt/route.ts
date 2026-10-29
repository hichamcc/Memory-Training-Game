import { getAllPosts } from '@/lib/blog';
import { tactics } from '@/lib/tactics';
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

// llms.txt (llmstxt.org): a plain Markdown map of the site for AI assistants
export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts();
  const body = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} (also written MemoryChampions) is a free website by ${AUTHOR.name}. Each technique has a guide (steps, examples, tips) and a free practice game. There is also a daily memory challenge.`,
    '',
    '## Memory techniques',
    '',
    ...tactics.map((t) => `- [${t.name}](${SITE_URL}/tactics/${t.id}): ${t.shortDescription}. Best for ${t.bestFor.toLowerCase()}.`),
    '',
    '## Guides',
    '',
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`),
    '',
    '## Optional',
    '',
    `- [All games](${SITE_URL}/games): every practice game on one page`,
    `- [Daily challenge](${SITE_URL}/daily): memorize 8 words, the same for everyone each day`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
