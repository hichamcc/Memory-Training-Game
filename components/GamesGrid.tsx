'use client';

import Link from 'next/link';
import { GAME_DESCRIPTIONS, LEARNING_PATH, getTacticById } from '@/lib/tactics';
import { useProgress } from '@/lib/useProgress';
import DifficultyBadge from './DifficultyBadge';

export default function GamesGrid() {
  const progress = useProgress();
  const games = LEARNING_PATH.flatMap((step) => step.ids).map((id) => getTacticById(id)!);

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {games.map((tactic) => {
        const best = progress?.tactics[tactic.id];
        return (
          <li key={tactic.id} className="flex flex-col rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl" aria-hidden="true">
                {tactic.icon}
              </div>
              <DifficultyBadge difficulty={tactic.difficulty} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{tactic.name}</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{GAME_DESCRIPTIONS[tactic.id]}</p>

            <div className="mt-auto">
              <p className="text-sm text-slate-500 mb-3 min-h-[1.25rem]">
                {best && (
                  <>
                    Best <span className="font-bold text-slate-900">{best.bestScore}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    {best.attempts} {best.attempts === 1 ? 'game' : 'games'}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tactics/${tactic.id}/practice`}
                  className="flex-1 inline-flex items-center justify-center min-h-[44px] whitespace-nowrap rounded-xl bg-blue-600 px-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                  aria-label={`Play ${tactic.name}`}
                >
                  {best ? 'Play again' : 'Play'}
                </Link>
                <Link
                  href={`/tactics/${tactic.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] whitespace-nowrap rounded-xl px-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label={`How the ${tactic.name} works`}
                >
                  How it works
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
