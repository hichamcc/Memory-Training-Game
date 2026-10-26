import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import PostCard from '@/components/PostCard';

export const metadata: Metadata = {
  title: 'Blog - Memory Champions',
  description: 'Practical guides to memory techniques: memory palaces, the linking method, number systems and how to train them.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <header className="max-w-2xl mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Blog</h1>
        <p className="text-lg text-slate-600">
          Practical guides to the techniques memory champions use, and how to train them.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-slate-500">No articles yet. Check back soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
