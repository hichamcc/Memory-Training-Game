'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTacticById } from '@/lib/tactics';
import { DifficultyLevel } from '@/types';
import LinkingGame from '@/components/games/LinkingGame';
import MemoryPalaceGame from '@/components/games/MemoryPalaceGame';
import PegSystemGame from '@/components/games/PegSystemGame';
import ChunkingGame from '@/components/games/ChunkingGame';
import FaceNameGame from '@/components/games/FaceNameGame';
import MajorSystemGame from '@/components/games/MajorSystemGame';
import PAOSystemGame from '@/components/games/PAOSystemGame';
import DominicSystemGame from '@/components/games/DominicSystemGame';

export default function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const tactic = getTacticById(id);

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Beginner');
  const [gameStarted, setGameStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalAccuracy, setFinalAccuracy] = useState<number | null>(null);

  if (!tactic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tactic not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Check which games are implemented
  const hasGame = id === 'linking-method' || id === 'memory-palace' || id === 'peg-system' || id === 'chunking' || id === 'face-name' || id === 'major-system' || id === 'pao-system' || id === 'dominic-system';

  if (!hasGame) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href={`/tactics/${id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tactic.name}
          </Link>

          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="text-6xl mb-6">🚧</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              The practice game for {tactic.name} is currently under development.
              Check back soon to test your skills with this technique!
            </p>
            <Link
              href={`/tactics/${id}`}
              className="inline-block bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Technique Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = (score: number, accuracy: number) => {
    setFinalScore(score);
    setFinalAccuracy(accuracy);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/tactics/${id}`}
            className="inline-flex items-center text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tactic.name}
          </Link>

          <div className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="text-3xl">{tactic.icon}</span>
            <span className="font-bold">{tactic.name}</span>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/50 min-h-[600px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20"></div>
          {!gameStarted ? (
            <div className="text-center w-full relative z-10">
              <div className="text-6xl mb-6 animate-float">🎯</div>
              <h1 className="text-5xl font-black text-gray-900 mb-6">
                Pick Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Challenge</span>
              </h1>
              <p className="text-gray-700 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Ready to test your memory skills? Choose your difficulty and let's go! 🚀
              </p>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
                <button
                  onClick={() => setSelectedDifficulty('Beginner')}
                  className={`p-8 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                    selectedDifficulty === 'Beginner'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl shadow-green-500/30 scale-105'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-lg'
                  }`}
                >
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="font-black text-gray-900 text-xl mb-3">Beginner</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    5 words<br />More time to think
                  </p>
                </button>

                <button
                  onClick={() => setSelectedDifficulty('Intermediate')}
                  className={`p-8 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                    selectedDifficulty === 'Intermediate'
                      ? 'border-orange-500 bg-gradient-to-br from-amber-50 to-orange-100 shadow-xl shadow-orange-500/30 scale-105'
                      : 'border-gray-300 bg-white hover:border-orange-400 hover:shadow-lg'
                  }`}
                >
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="font-black text-gray-900 text-xl mb-3">Intermediate</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    8 words<br />Moderate challenge
                  </p>
                </button>

                <button
                  onClick={() => setSelectedDifficulty('Advanced')}
                  className={`p-8 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                    selectedDifficulty === 'Advanced'
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-100 shadow-xl shadow-red-500/30 scale-105'
                      : 'border-gray-300 bg-white hover:border-red-400 hover:shadow-lg'
                  }`}
                >
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="font-black text-gray-900 text-xl mb-3">Advanced</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    12 words<br />Maximum difficulty!
                  </p>
                </button>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl animate-pulse-glow"
              >
                🎮 Let's Play!
              </button>
            </div>
          ) : (
            <div className="w-full">
              {id === 'linking-method' && (
                <LinkingGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'memory-palace' && (
                <MemoryPalaceGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'peg-system' && (
                <PegSystemGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'chunking' && (
                <ChunkingGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'face-name' && (
                <FaceNameGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'major-system' && (
                <MajorSystemGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'pao-system' && (
                <PAOSystemGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}
              {id === 'dominic-system' && (
                <DominicSystemGame
                  difficulty={selectedDifficulty}
                  onComplete={handleComplete}
                />
              )}

              {finalScore !== null && (
                <div className="mt-8 text-center">
                  <Link
                    href="/"
                    className="inline-block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back to All Tactics
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm">
            Created by{' '}
            <a
              href="https://www.codebyhicham.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white font-semibold underline decoration-white/40 hover:decoration-white transition-colors"
            >
              codebyhicham
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
