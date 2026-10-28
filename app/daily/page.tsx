import type { Metadata } from 'next';
import DailyChallenge from '@/components/DailyChallenge';

export const metadata: Metadata = {
  title: 'Daily Challenge - Memory Champions',
  description: 'One quick memory challenge a day, the same words for everyone. Build your streak and share your score.',
  alternates: { canonical: '/daily' },
};

export default function DailyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <DailyChallenge />
    </div>
  );
}
