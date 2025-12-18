'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface ChunkingGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Generate random numbers for chunking
const generateNumberSequence = (length: number): string => {
  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += Math.floor(Math.random() * 10).toString();
  }
  return sequence;
};

// Helper to chunk a sequence
const chunkSequence = (sequence: string, chunkSize: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < sequence.length; i += chunkSize) {
    chunks.push(sequence.slice(i, i + chunkSize));
  }
  return chunks;
};

export default function ChunkingGame({ difficulty, onComplete }: ChunkingGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [numberSequence, setNumberSequence] = useState('');
  const [chunks, setChunks] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { sequenceLength: 9, chunkSize: 3, memorizeTime: 8 },
    Intermediate: { sequenceLength: 12, chunkSize: 3, memorizeTime: 6 },
    Advanced: { sequenceLength: 16, chunkSize: 4, memorizeTime: 5 }
  };

  const { sequenceLength, chunkSize, memorizeTime } = config[difficulty];

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0) {
      setPhase('recall');
    }
  }, [phase, timeLeft]);

  const startGame = () => {
    const sequence = generateNumberSequence(sequenceLength);
    const chunkedSequence = chunkSequence(sequence, chunkSize);
    setNumberSequence(sequence);
    setChunks(chunkedSequence);
    setPhase('memorize');
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswer('');
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    finishGame();
  };

  const finishGame = () => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    // Remove any spaces or dashes from user answer
    const cleanedAnswer = userAnswer.replace(/[\s-]/g, '');

    // Calculate how many digits are correct
    let correctDigits = 0;
    for (let i = 0; i < numberSequence.length; i++) {
      if (cleanedAnswer[i] === numberSequence[i]) {
        correctDigits++;
      }
    }

    const accuracyValue = (correctDigits / numberSequence.length) * 100;
    const result = calculateScore(correctDigits, numberSequence.length, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(Math.round(accuracyValue));

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'chunking',
      score: result.score,
      accuracy: Math.round(accuracyValue),
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'chunking',
      difficulty,
      itemsToMemorize: [numberSequence],
      userAnswers: [userAnswer],
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
    setNumberSequence('');
    setChunks([]);
    setUserAnswer('');
    setTimeLeft(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🧩</div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chunking Challenge
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Break long numbers into smaller chunks to remember them easily! Like phone numbers! 📱
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-black mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-purple-600 mb-1">{sequenceLength}</div>
              <div className="text-gray-700 font-semibold text-sm">Digits to Remember</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time to Memorize</div>
            </div>
          </div>
          <div className="mt-4 bg-white/60 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-black text-green-600 mb-1">{chunks.length || Math.ceil(sequenceLength / chunkSize)} Chunks</div>
            <div className="text-gray-700 font-semibold text-sm">{chunkSize} digits per chunk</div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
        >
          🚀 Start Chunking!
        </button>
      </div>
    );
  }

  if (phase === 'memorize') {
    return (
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Memorize these chunks! 🧩
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-12 shadow-2xl border-4 border-yellow-300 mb-8">
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {chunks.map((chunk, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl px-8 py-6 shadow-xl transform hover:scale-110 transition-transform"
                >
                  <div className="text-5xl font-black tracking-wider">
                    {chunk}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-8 py-4">
            <div className="text-5xl font-black animate-pulse">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-purple-200">
          <p className="text-gray-800 font-bold text-lg mb-2">
            ✨ Group them in your mind! ✨
          </p>
          <p className="text-gray-600 text-sm">
            Look for patterns: repeating digits, ascending/descending sequences, or familiar numbers!
          </p>
        </div>

        <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 max-w-2xl mx-auto border-2 border-green-300">
          <p className="text-gray-800 font-bold text-sm mb-2">💡 Example Strategy:</p>
          <p className="text-gray-700 text-sm">
            For "149217761945" → Think: <strong>1492</strong> (Columbus), <strong>1776</strong> (Independence), <strong>1945</strong> (WWII)
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🤔</div>
        <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Time to Recall!
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 text-center font-medium">
          Type the number sequence you just saw. You can use spaces or dashes if it helps!
        </p>

        <form onSubmit={handleSubmitAnswer} className="mb-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-6">
            <label className="block text-gray-700 font-bold mb-4 text-lg">
              Enter the {sequenceLength}-digit sequence:
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-8 py-6 rounded-full border-3 border-purple-300 focus:border-purple-500 focus:outline-none text-2xl font-black text-center shadow-lg bg-white tracking-widest"
              placeholder="123 456 789"
              autoFocus
            />
            <p className="text-gray-600 text-sm mt-4 text-center">
              Type {sequenceLength} digits (spaces and dashes are optional)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl"
          >
            ✓ Submit Answer
          </button>
        </form>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border-2 border-yellow-200">
          <p className="text-gray-700 text-sm text-center">
            <strong>Hint:</strong> Remember the chunks you created! Recall them one by one.
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const cleanedUserAnswer = userAnswer.replace(/[\s-]/g, '');
    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    // Compare digit by digit
    const comparison = numberSequence.split('').map((digit, index) => ({
      correct: digit,
      user: cleanedUserAnswer[index] || '',
      isCorrect: digit === cleanedUserAnswer[index]
    }));

    return (
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="text-7xl mb-6 animate-float">
          {isGreat ? '🎉' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {isGreat ? 'Incredible!' : isGood ? 'Good Work!' : 'Nice Try!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'re a chunking master! 🧩' : isGood ? 'Your chunking skills are growing! ⭐' : 'Keep practicing those chunks! 🌟'}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 shadow-xl border-3 border-purple-300 transform hover:scale-105 transition-transform">
            <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">{score}</div>
            <div className="text-gray-800 font-bold text-lg">🎯 Score</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 shadow-xl border-3 border-green-300 transform hover:scale-105 transition-transform">
            <div className="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">{accuracy}%</div>
            <div className="text-gray-800 font-bold text-lg">✓ Accuracy</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-8">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="text-3xl">📊</span>
            <h3 className="font-black text-gray-900 text-2xl">Digit by Digit</h3>
          </div>

          <div className="mb-6">
            <div className="text-sm font-bold text-gray-600 mb-3">Correct Sequence (in chunks):</div>
            <div className="flex flex-wrap justify-center gap-3">
              {chunks.map((chunk, index) => (
                <div key={index} className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl px-6 py-3 shadow-lg">
                  <div className="text-3xl font-black tracking-wider">{chunk}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-bold text-gray-600 mb-3">Your Answer:</div>
            <div className="bg-white rounded-2xl p-4 shadow-inner">
              <div className="text-3xl font-black tracking-wider text-gray-900">
                {cleanedUserAnswer || '(nothing)'}
              </div>
            </div>
          </div>

          <div className="text-sm font-bold text-gray-600 mb-3">Detailed Comparison:</div>
          <div className="flex flex-wrap justify-center gap-2">
            {comparison.map((item, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black shadow-md ${
                  item.isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {item.user || '?'}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
          >
            🔄 Try Another!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
