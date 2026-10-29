import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false },
};

// Shown by the service worker when a page isn't cached and there's no connection
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">📡</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">You&apos;re offline</h1>
      <p className="text-slate-600 mb-8">
        This page hasn&apos;t been saved on your device yet. Games you&apos;ve already opened still work without a
        connection.
      </p>
      <Link
        href="/games"
        className="inline-flex items-center justify-center min-h-[48px] rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Go to all games
      </Link>
    </div>
  );
}
