'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { getTacticById, getNextTactic } from '@/lib/tactics';
import { getHighScoreForTactic } from '@/lib/storage';
import { useProgress } from '@/lib/useProgress';
import { DifficultyLevel } from '@/types';
import LinkingGame from '@/components/games/LinkingGame';
import MemoryPalaceGame from '@/components/games/MemoryPalaceGame';
import PegSystemGame from '@/components/games/PegSystemGame';
import ChunkingGame from '@/components/games/ChunkingGame';
import FaceNameGame from '@/components/games/FaceNameGame';
import MajorSystemGame from '@/components/games/MajorSystemGame';
import PAOSystemGame from '@/components/games/PAOSystemGame';
import DominicSystemGame from '@/components/games/DominicSystemGame';

const GAMES = {
  'linking-method': LinkingGame,
  'memory-palace': MemoryPalaceGame,
  'peg-system': PegSystemGame,
  'chunking': ChunkingGame,
  'face-name': FaceNameGame,
  'major-system': MajorSystemGame,
  'pao-system': PAOSystemGame,
  'dominic-system': DominicSystemGame,
} as const;

const DIFFICULTIES: { level: DifficultyLevel; icon: string; text: string; selected: string }[] = [
  { level: 'Beginner', icon: '🌱', text: 'Fewer items, more time', selected: 'border-emerald-500 bg-emerald-50 ring-emerald-100' },
  { level: 'Intermediate', icon: '⚡', text: 'More items, less time', selected: 'border-amber-500 bg-amber-50 ring-amber-100' },
  { level: 'Advanced', icon: '🔥', text: 'Many items, quick display', selected: 'border-red-500 bg-red-50 ring-red-100' },
];

export default function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tactic = getTacticById(id);
  const progress = useProgress();

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Beginner');
  const [gameStarted, setGameStarted] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [newBest, setNewBest] = useState<{ score: number; previous: number } | null>(null);

  const Game = GAMES[id as keyof typeof GAMES];

  if (!tactic || !Game) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Technique not found</h1>
        <Link href="/" className="font-semibold text-blue-600 hover:underline">
          Back to all techniques
        </Link>
      </div>
    );
  }

  const startGame = () => {
    setPreviousBest(getHighScoreForTactic(id)?.score ?? null);
    setFinalScore(null);
    setNewBest(null);
    setGameStarted(true);
  };

  // Games have their own "play again", so the best is carried forward here
  // rather than re-read only when the game first starts
  const handleComplete = (score: number) => {
    setNewBest(previousBest !== null && score > previousBest ? { score, previous: previousBest } : null);
    setPreviousBest((prev) => Math.max(prev ?? score, score));
    setFinalScore(score);
  };
  const nextTactic = getNextTactic(id);
  const best = progress?.tactics[id];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href={`/tactics/${id}`}
          className="inline-flex items-center min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span aria-hidden="true" className="mr-1.5">←</span>
          {tactic.name} guide
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="hidden sm:inline text-xl" aria-hidden="true">{tactic.icon}</span>
          <span className="hidden sm:inline">{tactic.name}</span>
          {best && (
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              Best {best.bestScore}
            </span>
          )}
        </div>
      </div>

      {newBest && (
        <div role="status" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center font-semibold text-amber-800 animate-fade-up">
          🏆 New personal best! {newBest.score} beats your previous {newBest.previous}.
        </div>
      )}

      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-10 min-h-[560px] flex items-center justify-center">
        {!gameStarted ? (
          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Pick your challenge
            </h1>
            <p className="text-slate-600 mb-8">
              New to {tactic.name}? Start with Beginner and work your way up.
            </p>

            <div role="radiogroup" aria-label="Difficulty" className="grid sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8">
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty === d.level;
                return (
                  <button
                    key={d.level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedDifficulty(d.level)}
                    className={`flex sm:flex-col items-center gap-4 sm:gap-2 rounded-2xl border-2 p-4 sm:p-6 text-left sm:text-center transition-all ${
                      isSelected ? `${d.selected} ring-4` : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl" aria-hidden="true">{d.icon}</span>
                    <span>
                      <span className="block font-bold text-slate-900 text-lg">{d.level}</span>
                      <span className="block text-sm text-slate-600">{d.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="inline-flex items-center justify-center min-h-[52px] w-full sm:w-auto px-10 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Start game
            </button>
          </div>
        ) : (
          <div className="w-full">
            <Game difficulty={selectedDifficulty} onComplete={handleComplete} />

            {finalScore !== null && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                {nextTactic && (
                  <Link
                    href={`/tactics/${nextTactic.id}`}
                    className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-white border border-slate-300 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Next technique: {nextTactic.name} →
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  All techniques
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
