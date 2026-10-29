import type { Metadata } from 'next';
import Link from 'next/link';
import GamesGrid from '@/components/GamesGrid';
import InstallApp from '@/components/InstallApp';

export const metadata: Metadata = {
  title: 'All Memory Games (Free)',
  description:
    'Play all 8 free memory training games in one place: linking, peg system, chunking, memory palace, names and faces, Major System, PAO and Dominic.',
  alternates: { canonical: '/games' },
};

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">All games</h1>
        <p className="text-lg text-slate-600">
          Every memory game in one place, easiest first. New to a technique? Read{' '}
          <span className="whitespace-nowrap">&ldquo;How it works&rdquo;</span> before you play.
        </p>
      </header>

      <InstallApp />

      <GamesGrid />

      <p className="mt-10 text-center text-slate-600">
        Want a quick workout instead?{' '}
        <Link href="/daily" className="font-semibold text-blue-600 hover:text-blue-700">
          Try today&apos;s challenge →
        </Link>
      </p>
    </div>
  );
}
