import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

// Posts live in content/blog/<slug>.md with a frontmatter block:
// ---
// title: ...
// description: ...   (used in the post list and for SEO)
// date: YYYY-MM-DD
// tactic: linking-method   (optional: adds a "practice this" card)
// ---
const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tactic?: string;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  html: string;
}

function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (key) data[key] = value;
  }
  return { data, body: match[2] };
}

function readPost(slug: string): { meta: PostMeta; body: string } | null {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
  if (!data.title || !data.date) {
    throw new Error(`Blog post ${slug}.md needs a title and date in its frontmatter`);
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    meta: {
      slug,
      title: data.title,
      description: data.description ?? '',
      date: data.date,
      tactic: data.tactic || undefined,
      readingMinutes: Math.max(1, Math.round(words / 220)),
    },
    body,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => readPost(file.replace(/\.md$/, ''))?.meta)
    .filter((meta): meta is PostMeta => meta !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | null {
  // Slugs come from the URL; only allow plain file names
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const post = readPost(slug);
  if (!post) return null;
  return { ...post.meta, html: marked.parse(post.body, { async: false }) };
}

export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
