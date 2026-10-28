import type { Metadata } from 'next';
import { getTacticById } from '@/lib/tactics';

// The practice page is a client component, so its metadata lives here
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tactic = getTacticById(id);
  if (!tactic) return {};
  return {
    title: `${tactic.name} Practice Game (Free)`,
    description: `Train the ${tactic.name} with a free timed memory game. Three difficulty levels, instant feedback and personal bests.`,
    alternates: { canonical: `/tactics/${tactic.id}/practice` },
  };
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
