export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200">
      {/* Bottom padding leaves room for the floating feedback button on phones */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:pb-8 text-center text-sm text-slate-500">
        {/* The header hides this link on small screens, so phones get it here */}
        <a
          href="https://thinkspeak.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden inline-flex items-center gap-1 min-h-[44px] mb-2 font-semibold text-slate-700 hover:text-slate-900"
        >
          Learn languages <span aria-hidden="true" className="text-xs">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <br className="md:hidden" />
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
