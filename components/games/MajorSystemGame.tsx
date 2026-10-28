'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';
import { decodeMajor, exampleFor, matchesNumber, soundsFor } from '@/lib/majorSystem';

interface MajorSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Major System digit-to-sound mappings
const MAJOR_SYSTEM_MAP = [
  { digit: 0, sounds: 's, z, soft c', examples: 'Sea, Zoo', color: 'from-blue-400 to-blue-600' },
  { digit: 1, sounds: 't, d', examples: 'Tea, Day', color: 'from-green-400 to-green-600' },
  { digit: 2, sounds: 'n', examples: 'Noah, New', color: 'from-yellow-400 to-yellow-600' },
  { digit: 3, sounds: 'm', examples: 'Ma, Moon', color: 'from-lime-400 to-lime-600' },
  { digit: 4, sounds: 'r', examples: 'Ray, Row', color: 'from-red-400 to-red-600' },
  { digit: 5, sounds: 'l', examples: 'Law, Owl', color: 'from-rose-400 to-rose-600' },
  { digit: 6, sounds: 'j, sh, ch', examples: 'Shoe, Jaw', color: 'from-orange-400 to-orange-600' },
  { digit: 7, sounds: 'k, hard c, g', examples: 'Key, Go', color: 'from-teal-400 to-teal-600' },
  { digit: 8, sounds: 'f, v', examples: 'Foe, Ivy', color: 'from-sky-400 to-sky-600' },
  { digit: 9, sounds: 'p, b', examples: 'Pie, Bee', color: 'from-cyan-400 to-cyan-600' },
];


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
  // Result of the current round, shown until the player moves on
  const [feedback, setFeedback] = useState<{ correct: boolean; decoded: string; example: string } | null>(null);

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
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ignore repeat submits while the feedback for this round is showing
    if (!userWord.trim() || feedback) return;

    const correct = matchesNumber(userWord, targetNumber);
    const readings = decodeMajor(userWord);
    setFeedback({
      correct,
      // Show the reading closest to the target, so a near miss is easy to spot
      decoded: correct ? targetNumber : readings.find((r) => r.length === targetNumber.length) ?? readings[0],
      example: exampleFor(targetNumber),
    });
    if (correct) setCorrectRounds(correctRounds + 1);
    setRoundsCompleted(roundsCompleted + 1);
  };

  const goToNextRound = () => {
    if (roundsCompleted >= totalRounds) {
      finishGame(correctRounds, totalRounds);
    } else {
      setPhase('memorize');
      startRound();
    }
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

        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Add any vowels you like (and w, h, y): they don&apos;t count. Longer numbers can be two words, like &quot;moon tea&quot; for 321.
        </p>
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

          {feedback ? (
            <div role="status" className="animate-fade-up">
              <div
                className={`rounded-2xl border-2 p-5 mb-4 text-left ${
                  feedback.correct ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
                }`}
              >
                <p className={`font-bold text-lg mb-2 ${feedback.correct ? 'text-emerald-800' : 'text-red-800'}`}>
                  {feedback.correct ? '✅ Correct!' : '❌ Not quite'}
                </p>
                <p className="text-slate-800">
                  <span className="font-bold">&ldquo;{userWord.trim()}&rdquo;</span> sounds like{' '}
                  <span className="font-semibold">{feedback.decoded ? soundsFor(feedback.decoded) : 'no counted sounds'}</span>
                  {feedback.decoded && (
                    <>
                      {' '}= <span className="font-bold tabular-nums">{feedback.decoded}</span>
                    </>
                  )}
                  {!feedback.correct && (
                    <>
                      , but {targetNumber} needs <span className="font-semibold">{soundsFor(targetNumber)}</span>.
                    </>
                  )}
                </p>
                {!feedback.correct && feedback.example && (
                  <p className="text-slate-700 mt-2">
                    Example: <span className="font-bold">{feedback.example}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={goToNextRound}
                autoFocus
                className="w-full min-h-[52px] bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                {roundsCompleted >= totalRounds ? 'See results' : 'Next number →'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="major-word" className="block text-gray-700 font-bold mb-2">
                  Type a word using those sounds:
                </label>
                <input
                  id="major-word"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={userWord}
                  onChange={(e) => setUserWord(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-xl font-bold text-center"
                  placeholder="Your word..."
                  autoFocus
                />
                {userWord.trim() && (
                  <p className="mt-2 text-sm text-slate-500 text-center" aria-live="polite">
                    Sounds so far: <span className="font-semibold text-slate-700">{soundsFor(decodeMajor(userWord)[0]) || '—'}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!userWord.trim()}
                className="w-full bg-blue-600 text-white px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-sm"
              >
                ✓ Check Word
              </button>
            </form>
          )}
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
