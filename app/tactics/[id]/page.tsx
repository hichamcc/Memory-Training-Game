import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTacticById, getNextTactic } from '@/lib/tactics';
import { SITE_NAME } from '@/lib/site';
import DifficultyBadge from '@/components/DifficultyBadge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tactic = getTacticById(id);
  if (!tactic) return {};
  const description = `${tactic.shortDescription}. Step-by-step guide, examples and tips, plus a free practice game. Best for: ${tactic.bestFor.toLowerCase()}.`;
  return {
    title: `${tactic.name}: How It Works, Examples & Practice - ${SITE_NAME}`,
    description,
    alternates: { canonical: `/tactics/${tactic.id}` },
    openGraph: { title: `${tactic.name}: how it works and how to practice it`, description, url: `/tactics/${tactic.id}` },
  };
}

export default async function TacticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tactic = getTacticById(id);

  if (!tactic) {
    notFound();
  }

  const nextTactic = getNextTactic(id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <span aria-hidden="true" className="mr-1.5">←</span>
        All techniques
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-4xl shadow-sm" aria-hidden="true">
            {tactic.icon}
          </div>
          <div className="min-w-0">
            <DifficultyBadge difficulty={tactic.difficulty} />
            <h1 className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 break-words">
              {tactic.name}
            </h1>
          </div>
        </div>
        <p className="text-lg text-slate-600">{tactic.shortDescription}</p>
        <p className="mt-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Best for:</span> {tactic.bestFor}
        </p>
      </header>

      {/* Practice CTA */}
      <div className="rounded-2xl bg-blue-600 p-6 sm:p-7 text-white shadow-sm mb-10 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">Ready to try it?</h2>
          <p className="text-blue-100 text-sm">
            Read the steps below first, then put the technique to work in a short timed game.
          </p>
        </div>
        <Link
          href={`/tactics/${tactic.id}/practice`}
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Start practice →
        </Link>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-3">What is it?</h2>
          <p className="text-slate-700 leading-relaxed">{tactic.fullDescription}</p>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-5">How to do it</h2>
          <ol className="space-y-4">
            {tactic.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-inset ring-blue-200">
                  {index + 1}
                </span>
                <p className="text-slate-700 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Examples</h2>
          <ul className="space-y-3">
            {tactic.examples.map((example, index) => (
              <li key={index} className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-slate-800">
                {example}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Pro tips</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {tactic.tips.map((tip, index) => (
              <li key={index} className="flex gap-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-slate-800">
                <span aria-hidden="true" className="text-teal-600 font-bold">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Bottom actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/tactics/${tactic.id}/practice`}
          className="flex-1 inline-flex items-center justify-center min-h-[52px] px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
        >
          Start practice
        </Link>
        {nextTactic && (
          <Link
            href={`/tactics/${nextTactic.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            Next technique: {nextTactic.name} →
          </Link>
        )}
      </div>
    </div>
  );
}
