'use client';

import { LEARNING_PATH, FIRST_TACTIC_ID, getTacticById } from '@/lib/tactics';
import { useProgress } from '@/lib/useProgress';
import TacticCard from './TacticCard';

export default function LearningPath() {
  const progress = useProgress();
  // Only point newcomers at the first tactic; returning players pick their own
  const isNewPlayer = progress !== null && Object.keys(progress.tactics).length === 0;

  return (
    <div className="space-y-12">
      {LEARNING_PATH.map((step, stepIndex) => (
        <section key={step.level} aria-labelledby={`path-${step.level}`}>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {stepIndex + 1}
            </span>
            <div>
              <h2 id={`path-${step.level}`} className="text-xl font-bold text-slate-900">
                {step.title}
              </h2>
              <p className="text-sm text-slate-500">{step.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {step.ids.map((id) => {
              const tactic = getTacticById(id);
              if (!tactic) return null;
              return (
                <TacticCard
                  key={id}
                  tactic={tactic}
                  progress={progress?.tactics[id]}
                  recommended={isNewPlayer && id === FIRST_TACTIC_ID}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
