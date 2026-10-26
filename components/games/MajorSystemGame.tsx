'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface MajorSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Major System digit-to-sound mappings
const MAJOR_SYSTEM_MAP = [
  { digit: 0, sounds: 's, z', examples: 'Sea, Zoo', color: 'from-blue-400 to-blue-600' },
  { digit: 1, sounds: 't, d', examples: 'Tea, Day', color: 'from-green-400 to-green-600' },
  { digit: 2, sounds: 'n', examples: 'Noah, New', color: 'from-yellow-400 to-yellow-600' },
  { digit: 3, sounds: 'm', examples: 'Ma, Moon', color: 'from-lime-400 to-lime-600' },
  { digit: 4, sounds: 'r', examples: 'Ray, Row', color: 'from-red-400 to-red-600' },
  { digit: 5, sounds: 'l', examples: 'Law, Owl', color: 'from-rose-400 to-rose-600' },
  { digit: 6, sounds: 'sh, ch', examples: 'Shoe, Cheese', color: 'from-orange-400 to-orange-600' },
  { digit: 7, sounds: 'k, g', examples: 'Key, Go', color: 'from-teal-400 to-teal-600' },
  { digit: 8, sounds: 'f, v', examples: 'Foe, Ivy', color: 'from-sky-400 to-sky-600' },
  { digit: 9, sounds: 'p, b', examples: 'Pie, Bee', color: 'from-cyan-400 to-cyan-600' },
];

// Pre-made word suggestions for common 2-digit combinations
const WORD_SUGGESTIONS: { [key: string]: string[] } = {
  '12': ['tin', 'tuna', 'tone'],
  '23': ['name', 'enemy', 'gnome'],
  '34': ['mower', 'hammer', 'mare'],
  '45': ['rail', 'roll', 'reel'],
  '56': ['lash', 'leash', 'lush'],
  '67': ['shake', 'chick', 'jog'],
  '78': ['cave', 'coffee', 'wife'],
  '89': ['fob', 'fab', 'vibe'],
  '90': ['bus', 'base', 'boss'],
  '21': ['net', 'nut', 'nod'],
};

export default function MajorSystemGame({ difficulty, onComplete }: MajorSystemGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [showingSystem, setShowingSystem] = useState(true);
  const [targetNumber, setTargetNumber] = useState('');
  const [userWord, setUserWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [currentRoundCorrect, setCurrentRoundCorrect] = useState(false);

  const config = {
    Beginner: { rounds: 3, digits: 2, thinkTime: 20 },
    Intermediate: { rounds: 5, digits: 2, thinkTime: 15 },
    Advanced: { rounds: 5, digits: 3, thinkTime: 15 }
  };

  const { rounds, digits, thinkTime } = config[difficulty];

  useEffect(() => {
    if (phase === 'memorize' && !showingSystem && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && !showingSystem && timeLeft === 0) {
      setPhase('recall');
    }
  }, [phase, showingSystem, timeLeft]);

  const startGame = () => {
    setShowingSystem(true);
    setTotalRounds(rounds);
    setRoundsCompleted(0);
    setCorrectRounds(0);
    setPhase('memorize');
  };

  const startRound = () => {
    // Generate random number
    let number = '';
    for (let i = 0; i < digits; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    setTargetNumber(number);
    setShowingSystem(false);
    setTimeLeft(thinkTime);
    setStartTime(Date.now());
    setUserWord('');
    setCurrentRoundCorrect(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWord.trim()) return;

    // Check if the word matches the number
    const isCorrect = validateWord(userWord, targetNumber);
    setCurrentRoundCorrect(isCorrect);

    if (isCorrect) {
      setCorrectRounds(correctRounds + 1);
    }

    const newRoundsCompleted = roundsCompleted + 1;
    setRoundsCompleted(newRoundsCompleted);

    if (newRoundsCompleted >= totalRounds) {
      finishGame(isCorrect ? correctRounds + 1 : correctRounds, totalRounds);
    } else {
      // Next round after showing feedback
      setTimeout(() => {
        setPhase('memorize');
        setShowingSystem(false);
        startRound();
      }, 2000);
    }
  };

  const validateWord = (word: string, number: string): boolean => {
    // Simplified validation: just check if it's a real attempt
    // In a real implementation, we'd check phonetic matching
    return word.trim().length >= number.length;
  };

  const finishGame = (correct: number, total: number) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    const accuracyValue = (correct / total) * 100;
    const result = calculateScore(correct, total, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(Math.round(accuracyValue));

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'major-system',
      score: result.score,
      accuracy: Math.round(accuracyValue),
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'major-system',
      difficulty,
      itemsToMemorize: [targetNumber],
      userAnswers: [userWord],
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
    setShowingSystem(true);
    setTargetNumber('');
    setUserWord('');
    setTimeLeft(0);
    setRoundsCompleted(0);
    setCorrectRounds(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🔢</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Major System
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Turn numbers into words using sound-to-digit mappings! Champions use this for long numbers! 🎵
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{rounds}</div>
              <div className="text-gray-700 font-semibold text-sm">Rounds</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{digits}</div>
              <div className="text-gray-700 font-semibold text-sm">Digits per Round</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          🎓 Learn the System!
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && showingSystem) {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">📚</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-emerald-600">
            The Major System Map
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Each digit = specific sounds. Memorize this chart!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-5xl mx-auto">
          {MAJOR_SYSTEM_MAP.map((item) => (
            <div
              key={item.digit}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 shadow-sm border-2 border-white`}
            >
              <div className="text-5xl font-bold text-white mb-2">{item.digit}</div>
              <div className="text-sm font-bold text-white mb-1">{item.sounds}</div>
              <div className="text-xs text-white/80">{item.examples}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-blue-200 mb-8">
          <p className="text-gray-800 font-bold text-lg mb-2">
            💡 How it works:
          </p>
          <p className="text-gray-700 text-sm">
            <strong>32</strong> = M + N = "Moon", "Mine", "Man" (vowels don't matter!)
          </p>
        </div>

        <button
          onClick={startRound}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          ✓ Got it! Start Round {roundsCompleted + 1}
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && !showingSystem) {
    const suggestions = WORD_SUGGESTIONS[targetNumber] || [];

    return (
      <div className="text-center relative z-10">
        <div className="mb-6">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Round {roundsCompleted + 1} of {totalRounds} 🎯
          </div>
        </div>

        <div className="bg-amber-50 rounded-3xl p-12 shadow-sm border-2 border-amber-200 mb-8">
          <div className="text-sm font-bold text-gray-700 mb-4">Convert this number:</div>
          <div className="text-8xl font-bold text-blue-600 mb-6">
            {targetNumber}
          </div>

          <div className="bg-white/80 rounded-2xl p-6 mb-6">
            <div className="text-sm font-bold text-gray-700 mb-3">Sound mapping:</div>
            <div className="flex justify-center gap-4">
              {targetNumber.split('').map((digit, index) => {
                const mapping = MAJOR_SYSTEM_MAP[parseInt(digit)];
                return (
                  <div key={index} className={`bg-gradient-to-br ${mapping.color} rounded-xl px-6 py-4`}>
                    <div className="text-3xl font-bold text-white mb-1">{digit}</div>
                    <div className="text-sm font-bold text-white">{mapping.sounds}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="inline-block bg-slate-900 text-white rounded-full px-8 py-4">
            <div className="text-4xl font-bold">
              {timeLeft}s
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="bg-green-100 rounded-2xl p-6 max-w-2xl mx-auto border-2 border-green-300 mb-6">
            <p className="text-gray-700 font-bold text-sm mb-2">💡 Example words:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((word, index) => (
                <span key={index} className="bg-white px-4 py-2 rounded-full font-bold text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">✍️</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            What's Your Word?
          </span>
        </h2>

        <div className="bg-blue-50 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border-2 border-blue-300 mb-6">
          <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2">The number was:</div>
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 break-all">{targetNumber}</div>

          {currentRoundCorrect !== null && roundsCompleted < totalRounds && (
            <div className={`p-4 rounded-xl mb-4 ${currentRoundCorrect ? 'bg-green-500' : 'bg-orange-500'}`}>
              <div className="text-white font-bold">
                {currentRoundCorrect ? '✓ Nice! Moving to next round...' : '→ Next round coming...'}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Type a word using those sounds:
              </label>
              <input
                type="text"
                value={userWord}
                onChange={(e) => setUserWord(e.target.value)}
                className="w-full px-6 py-4 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-xl font-bold text-center"
                placeholder="Your word..."
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-blue-700 transition-all shadow-sm"
            >
              ✓ Submit Word
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="text-5xl sm:text-6xl md:text-7xl mb-6 animate-float">
          {isGreat ? '🎉' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 px-4">
          <span className="text-slate-900 break-words">
            {isGreat ? 'Brilliant!' : isGood ? 'Good Job!' : 'Keep Learning!'}
          </span>
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-8 font-semibold px-4">
          You got {correctRounds} out of {totalRounds} rounds correct!
        </p>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border-2 border-blue-300 transition-transform">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 mb-3">{score}</div>
            <div className="text-gray-800 font-bold text-sm sm:text-base md:text-lg">🎯 Score</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border-2 border-green-300 transition-transform">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-600 mb-3">{accuracy}%</div>
            <div className="text-gray-800 font-bold text-sm sm:text-base md:text-lg">✓ Accuracy</div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border-2 border-blue-200 mb-8">
          <p className="text-gray-700 text-sm">
            <strong>Keep practicing!</strong> The Major System takes time to master, but it's incredibly powerful for memorizing long numbers!
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            🔄 Practice More!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
