import Link from 'next/link';
import { PostMeta, formatPostDate } from '@/lib/blog';

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl bg-white border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
    >
      <p className="text-xs font-semibold text-slate-500 mb-2">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span className="mx-1.5 text-slate-300">·</span>
        {post.readingMinutes} min read
      </p>
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">{post.description}</p>
      <span className="mt-auto text-sm font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
        Read article →
      </span>
    </Link>
  );
}
