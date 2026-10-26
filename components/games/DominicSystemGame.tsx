'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface DominicSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Simplified Dominic System - one person per digit (0-9). Each digit uses the
// real Dominic letter (0=O, 1=A, 2=B, 3=C, 4=D, 5=E, 6=S, 7=G, 8=H, 9=N), and the
// person is the one the full system gives the double: 11 = AA, 22 = BB, ...
const DOMINIC_SYSTEM = [
  { digit: '0', person: 'Ozzy Osbourne', action: 'Head-banging', emoji: '🤘', color: 'from-gray-400 to-gray-600', initials: 'OO' },
  { digit: '1', person: 'Andre Agassi', action: 'Serving', emoji: '🎾', color: 'from-blue-400 to-blue-600', initials: 'AA' },
  { digit: '2', person: 'Bugs Bunny', action: 'Munching a carrot', emoji: '🐰', color: 'from-rose-400 to-rose-600', initials: 'BB' },
  { digit: '3', person: 'Charlie Chaplin', action: 'Twirling a cane', emoji: '🎩', color: 'from-yellow-400 to-yellow-600', initials: 'CC' },
  { digit: '4', person: 'Donald Duck', action: 'Quacking', emoji: '🦆', color: 'from-green-400 to-green-600', initials: 'DD' },
  { digit: '5', person: 'Emilio Estevez', action: 'Coaching hockey', emoji: '🏒', color: 'from-lime-400 to-lime-600', initials: 'EE' },
  { digit: '6', person: 'SpongeBob SquarePants', action: 'Flipping burgers', emoji: '🧽', color: 'from-red-400 to-red-600', initials: 'SS' },
  { digit: '7', person: 'Gal Gadot', action: 'Swinging a lasso', emoji: '🦸‍♀️', color: 'from-orange-400 to-orange-600', initials: 'GG' },
  { digit: '8', person: 'Harry Houdini', action: 'Escaping chains', emoji: '🔓', color: 'from-sky-400 to-sky-600', initials: 'HH' },
  { digit: '9', person: 'Nigel Ng', action: 'Frying rice', emoji: '🍳', color: 'from-amber-400 to-amber-600', initials: 'NN' },
];

interface Round {
  sequence: string;
  scenes: Array<{ person: string; action: string; emoji1: string; emoji2: string }>;
}

export default function DominicSystemGame({ difficulty, onComplete }: DominicSystemGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showSystem, setShowSystem] = useState(true);

  const config = {
    Beginner: { numRounds: 3, digitsPerRound: 4, memorizeTime: 10 },
    Intermediate: { numRounds: 4, digitsPerRound: 4, memorizeTime: 8 },
    Advanced: { numRounds: 5, digitsPerRound: 6, memorizeTime: 6 }
  };

  const { numRounds, digitsPerRound, memorizeTime } = config[difficulty];

  // Generate random number sequences and create scenes
  const generateRounds = (): Round[] => {
    const newRounds: Round[] = [];
    for (let i = 0; i < numRounds; i++) {
      let sequence = '';
      for (let j = 0; j < digitsPerRound; j++) {
        sequence += Math.floor(Math.random() * 10).toString();
      }

      const scenes = [];
      // Create scenes by pairing digits (person from first, action from second)
      for (let j = 0; j < sequence.length; j += 2) {
        if (j + 1 < sequence.length) {
          const digit1 = sequence[j];
          const digit2 = sequence[j + 1];
          const personData = DOMINIC_SYSTEM.find(d => d.digit === digit1);
          const actionData = DOMINIC_SYSTEM.find(d => d.digit === digit2);

          if (personData && actionData) {
            scenes.push({
              person: personData.person,
              action: actionData.action,
              emoji1: personData.emoji,
              emoji2: actionData.emoji
            });
          }
        }
      }

      newRounds.push({ sequence, scenes });
    }
    return newRounds;
  };

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0) {
      setPhase('recall');
    }
  }, [phase, timeLeft]);

  const startGame = () => {
    setShowSystem(false);
    const newRounds = generateRounds();
    setRounds(newRounds);
    setCurrentRound(0);
    setUserAnswers([]);
    setPhase('memorize');
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;

    const newAnswers = [...userAnswers, currentAnswer.replace(/\s/g, '')];
    setUserAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentRound < rounds.length - 1) {
      // Go to next round
      setCurrentRound(currentRound + 1);
      setPhase('memorize');
      setTimeLeft(memorizeTime);
    } else {
      // Game complete
      finishGame(newAnswers);
    }
  };

  const finishGame = (answers: string[]) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    // Calculate total correct digits
    let totalCorrect = 0;
    let totalDigits = 0;

    rounds.forEach((round, index) => {
      const userAnswer = answers[index] || '';
      totalDigits += round.sequence.length;

      for (let i = 0; i < round.sequence.length; i++) {
        if (userAnswer[i] === round.sequence[i]) {
          totalCorrect++;
        }
      }
    });

    const accuracyValue = totalDigits > 0 ? (totalCorrect / totalDigits) * 100 : 0;
    const result = calculateScore(totalCorrect, totalDigits, timeElapsed, difficulty);

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'dominic-system',
      score: result.score,
      accuracy: Math.round(accuracyValue),
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'dominic-system',
      difficulty,
      itemsToMemorize: rounds.map(r => r.sequence),
      userAnswers: answers,
      startTime,
      endTime,
      score: result.score,
      accuracy: Math.round(accuracyValue)
    };
    saveGameSession(session);

    setPhase('results');
    onComplete(result.score, Math.round(accuracyValue));
  };

  const resetGame = () => {
    setPhase('intro');
    setShowSystem(true);
    setCurrentRound(0);
    setRounds([]);
    setUserAnswers([]);
    setCurrentAnswer('');
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10 max-w-6xl mx-auto">
        <div className="text-6xl mb-6 animate-float">🎭</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Dominic System Challenge
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Turn numbers into famous people and their actions! Created by memory champion Dominic O&apos;Brien! 🏆
        </p>

        {showSystem ? (
          <div>
            <div className="bg-slate-50 rounded-2xl p-8 mb-8 border-2 border-slate-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📖 Meet Your Characters!</h3>
              <p className="text-gray-700 mb-6 text-sm">Each digit (0-9) represents a famous person with their signature action:</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {DOMINIC_SYSTEM.map((item) => (
                  <div
                    key={item.digit}
                    className={`bg-gradient-to-br ${item.color} text-white rounded-xl p-4 shadow-lg transition-transform`}
                  >
                    <div className="text-4xl mb-2">{item.emoji}</div>
                    <div className="text-3xl font-bold mb-1">{item.digit}</div>
                    <div className="text-xs font-bold mb-1 opacity-90">{item.initials}</div>
                    <div className="text-sm font-bold mb-1">{item.person}</div>
                    <div className="text-xs opacity-90">{item.action}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white/60 backdrop-blur rounded-xl p-4">
                <p className="text-gray-800 font-bold text-sm mb-2">💡 How it works:</p>
                <p className="text-gray-700 text-sm mb-2">
                  Each digit is a letter (1=A, 2=B, 3=C… but 0=O, 6=S, 9=N), and each person&apos;s initials are that letter twice.
                </p>
                <p className="text-gray-700 text-sm">
                  For &quot;23&quot; → Person from 2 (Bugs Bunny) + Action from 3 (Twirling a cane) = <strong>Bugs Bunny twirling a cane!</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 mb-8 border-2 border-blue-200 shadow-lg">
              <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
                {difficulty} Mode
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{numRounds}</div>
                  <div className="text-gray-700 font-semibold text-sm">Rounds</div>
                </div>
                <div className="bg-white/60 backdrop-blur rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{digitsPerRound}</div>
                  <div className="text-gray-700 font-semibold text-sm">Digits Each</div>
                </div>
                <div className="bg-white/60 backdrop-blur rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{memorizeTime}s</div>
                  <div className="text-gray-700 font-semibold text-sm">Per Round</div>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              🎬 Start the Show!
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (phase === 'memorize') {
    const round = rounds[currentRound];

    return (
      <div className="text-center relative z-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-sm font-bold text-gray-700 mb-2 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Round {currentRound + 1} of {rounds.length} 🎬
          </div>
        </div>

        <div className="bg-amber-50 rounded-3xl p-10 shadow-sm border-2 border-amber-200 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Imagine these scenes clearly!</h3>

          <div className="space-y-4 mb-8">
            {round.scenes.map((scene, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm transition-transform"
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-5xl">{scene.emoji1}</span>
                  <span className="text-3xl">+</span>
                  <span className="text-5xl">{scene.emoji2}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {scene.person} {scene.action}!
                </div>
              </div>
            ))}
          </div>

          <div className="inline-block bg-slate-900 text-white rounded-full px-8 py-4">
            <div className="text-5xl font-bold">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border-2 border-slate-200">
          <p className="text-gray-800 font-bold text-sm">
            ✨ Make it clear! See the scene in your mind like a movie! ✨
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    const round = rounds[currentRound];

    return (
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🤔</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            Decode the Scenes!
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-4 text-center font-medium">
          Round {currentRound + 1} of {rounds.length}
        </p>
        <p className="text-gray-600 text-sm mb-8 text-center">
          Think: Who was doing what? Match them back to their numbers!
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-6 border-2 border-slate-200">
          <p className="text-gray-700 font-bold mb-4 text-sm">Scenes you saw:</p>
          {round.scenes.map((scene, index) => (
            <div key={index} className="text-gray-900 font-semibold mb-2">
              {scene.emoji1} {scene.person} {scene.action} {scene.emoji2}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitAnswer} className="mb-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-blue-200 mb-6">
            <label className="block text-gray-700 font-bold mb-4 text-lg">
              Enter the {digitsPerRound}-digit sequence:
            </label>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-8 py-6 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-2xl font-bold text-center shadow-lg bg-white tracking-widest"
              placeholder="e.g., 2314"
              maxLength={digitsPerRound}
              autoFocus
            />
            <p className="text-gray-600 text-sm mt-4 text-center">
              Type {digitsPerRound} digits
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            ✓ {currentRound < rounds.length - 1 ? 'Next Round' : 'Finish Game'}
          </button>
        </form>
      </div>
    );
  }

  if (phase === 'results') {
    let totalCorrect = 0;
    let totalDigits = 0;

    rounds.forEach((round, index) => {
      const userAnswer = userAnswers[index] || '';
      totalDigits += round.sequence.length;

      for (let i = 0; i < round.sequence.length; i++) {
        if (userAnswer[i] === round.sequence[i]) {
          totalCorrect++;
        }
      }
    });

    const accuracy = totalDigits > 0 ? Math.round((totalCorrect / totalDigits) * 100) : 0;
    const score = Math.round((totalCorrect / totalDigits) * 1000 * (difficulty === 'Advanced' ? 1.5 : difficulty === 'Intermediate' ? 1.2 : 1));

    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="text-7xl mb-6 animate-float">
          {isGreat ? '🎭' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-2">
          <span className="text-blue-600">
            {isGreat ? 'Master Performance!' : isGood ? 'Great Show!' : 'Keep Practicing!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'re a Dominic System expert! 🏆' : isGood ? 'Your memory acting skills are growing! ⭐' : 'Keep practicing those scenes! 🌟'}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-3xl p-8 shadow-sm border-2 border-blue-300 transition-transform">
            <div className="text-6xl font-bold text-blue-600 mb-3">{score}</div>
            <div className="text-gray-800 font-bold text-lg">🎯 Score</div>
          </div>
          <div className="bg-emerald-50 rounded-3xl p-8 shadow-sm border-2 border-green-300 transition-transform">
            <div className="text-6xl font-bold text-emerald-600 mb-3">{accuracy}%</div>
            <div className="text-gray-800 font-bold text-lg">✓ Accuracy</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-200 mb-8">
          <h3 className="font-bold text-gray-900 text-2xl mb-6">📊 Round by Round</h3>

          <div className="space-y-4">
            {rounds.map((round, index) => {
              const userAnswer = userAnswers[index] || '';
              const isCorrect = userAnswer === round.sequence;

              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-sm font-bold text-gray-600 mb-2">Round {index + 1}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Correct:</div>
                      <div className="text-2xl font-bold text-green-600">{round.sequence}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Your Answer:</div>
                      <div className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {userAnswer || '(skipped)'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    {round.scenes.map((scene, i) => (
                      <div key={i}>
                        {scene.emoji1} {scene.person} {scene.action}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          🔄 Try Another!
        </button>
      </div>
    );
  }

  return null;
}
