import Link from 'next/link';
import { Tactic, TacticProgress } from '@/types';
import DifficultyBadge from './DifficultyBadge';

interface TacticCardProps {
  tactic: Tactic;
  progress?: TacticProgress;
  recommended?: boolean;
}

export default function TacticCard({ tactic, progress, recommended }: TacticCardProps) {
  return (
    <Link
      href={`/tactics/${tactic.id}`}
      className={`group relative flex h-full flex-col rounded-2xl bg-white p-6 border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        recommended ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
          Start here
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl" aria-hidden="true">
          {tactic.icon}
        </div>
        <DifficultyBadge difficulty={tactic.difficulty} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors">
        {tactic.name}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
        {tactic.shortDescription}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
        {progress ? (
          <>
            <span className="text-slate-500">
              Best <span className="font-bold text-slate-900">{progress.bestScore}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              {progress.attempts} {progress.attempts === 1 ? 'game' : 'games'}
            </span>
            <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              Improve →
            </span>
          </>
        ) : (
          <>
            <span className="text-slate-500 truncate pr-2">{tactic.bestFor.split(',')[0]}</span>
            <span className="font-semibold text-blue-600 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
              Learn →
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
