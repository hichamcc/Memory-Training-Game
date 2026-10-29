import Link from 'next/link';
import HeaderFeedbackLink from './HeaderFeedbackLink';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 min-h-[44px]">
          <span className="text-2xl" aria-hidden="true">🧠</span>
          <span className="whitespace-nowrap">Memory Champions</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-semibold">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center min-h-[44px] px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Techniques
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center min-h-[44px] px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Games
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center min-h-[44px] px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Blog
          </Link>
          <a
            href="https://thinkspeak.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 min-h-[44px] px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Learn languages
            <span aria-hidden="true" className="text-xs">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <HeaderFeedbackLink />
          <Link
            href="/daily"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <span aria-hidden="true">📅</span>
            <span className="sm:hidden">Daily</span>
            <span className="hidden sm:inline">Daily challenge</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
