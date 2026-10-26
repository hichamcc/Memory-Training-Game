'use client';

import Link from 'next/link';
import { tactics } from '@/lib/tactics';
import { useProgress } from '@/lib/useProgress';

export default function ProgressSummary() {
  const progress = useProgress();
  if (!progress || progress.totalGames === 0) return null;

  const tacticsTried = Object.keys(progress.tactics).length;

  const stats = [
    {
      label: 'Day streak',
      value: progress.streak,
      icon: '🔥',
      hint: progress.streak === 0 ? 'Play today to start one' : 'Keep it going!',
    },
    { label: 'Games played', value: progress.totalGames, icon: '🎮' },
    { label: 'Techniques tried', value: `${tacticsTried}/${tactics.length}`, icon: '🧠' },
  ];

  return (
    <section aria-label="Your progress" className="mb-12 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="grid grid-cols-3 gap-3 flex-1">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-50 px-3 py-3 sm:px-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                <span className="mr-1 text-xl sm:text-2xl" aria-hidden="true">{stat.icon}</span>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
              {stat.hint && <div className="hidden sm:block text-xs text-blue-600 mt-1">{stat.hint}</div>}
            </div>
          ))}
        </div>

        {progress.dailyToday ? (
          <Link
            href="/daily"
            className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 lg:w-72 hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="text-sm font-bold text-emerald-800">✓ Daily challenge done</div>
              <div className="text-sm text-emerald-700">
                {progress.dailyToday.marks.filter(Boolean).length}/{progress.dailyToday.marks.length} words · see result
              </div>
            </div>
            <span className="text-emerald-700" aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link
            href="/daily"
            className="flex items-center justify-between gap-4 rounded-xl bg-blue-600 px-5 py-4 text-white lg:w-72 hover:bg-blue-700 transition-colors"
          >
            <div>
              <div className="text-sm font-bold">📅 Today&apos;s challenge</div>
              <div className="text-sm text-blue-100">2 minutes · same words for everyone</div>
            </div>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
