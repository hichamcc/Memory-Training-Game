import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200">
      {/* Bottom padding leaves room for the floating feedback button on phones */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:pb-8 text-center text-sm text-slate-500">
        {/* The header hides these links on small screens, so phones get them here */}
        <nav aria-label="More" className="sm:hidden flex justify-center gap-2 mb-1 font-semibold text-slate-700">
          <Link href="/blog" className="inline-flex items-center min-h-[44px] px-3 hover:text-slate-900">Blog</Link>
          <Link href="/" className="inline-flex items-center min-h-[44px] px-3 hover:text-slate-900">Techniques</Link>
        </nav>
        <a
          href="https://thinkspeak.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="lg:hidden inline-flex items-center gap-1 min-h-[44px] mb-2 font-semibold text-slate-700 hover:text-slate-900"
        >
          Learn languages <span aria-hidden="true" className="text-xs">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <br className="lg:hidden" />
        Created by{' '}
        <a
          href="https://www.codebyhicham.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-700 underline decoration-slate-300 hover:decoration-slate-700 transition-colors"
        >
          codebyhicham
        </a>
      </div>
    </footer>
  );
}
