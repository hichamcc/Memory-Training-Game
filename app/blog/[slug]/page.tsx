import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPostDate, getAllPosts, getPostBySlug } from '@/lib/blog';
import { getTacticById } from '@/lib/tactics';
import PostCard from '@/components/PostCard';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} - Memory Champions`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const tactic = post.tactic ? getTacticById(post.tactic) : undefined;
  const morePosts = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/blog"
        className="inline-flex items-center min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <span aria-hidden="true" className="mr-1.5">←</span>
        All articles
      </Link>

      <article>
        <header className="mb-8">
          <p className="text-sm font-semibold text-slate-500 mb-3">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span className="mx-1.5 text-slate-300">·</span>
            {post.readingMinutes} min read
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">{post.title}</h1>
          {post.description && <p className="text-lg sm:text-xl text-slate-600">{post.description}</p>}
        </header>

        {/* Post HTML comes from Markdown files committed to this repo, not from users */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      {tactic && (
        <aside className="mt-12 rounded-2xl bg-blue-600 p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="text-4xl" aria-hidden="true">{tactic.icon}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Try the {tactic.name}</h2>
            <p className="text-blue-100 text-sm">Reading is step one. Lock it in with a two-minute practice game.</p>
          </div>
          <Link
            href={`/tactics/${tactic.id}/practice`}
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Practice now →
          </Link>
        </aside>
      )}

      {morePosts.length > 0 && (
        <section aria-labelledby="more-articles" className="mt-14">
          <h2 id="more-articles" className="text-xl font-bold text-slate-900 mb-5">Keep reading</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {morePosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
