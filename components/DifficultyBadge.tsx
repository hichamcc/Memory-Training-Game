import { DifficultyLevel } from '@/types';

const styles: Record<DifficultyLevel, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 ring-amber-200',
  Advanced: 'bg-red-50 text-red-700 ring-red-200',
};

export default function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
