'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { getRandomWords, checkAnswer } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface PegSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// The classic rhyming pegs. Each one rhymes with its number and is easy to
// picture (8 uses "skate" rather than "gate", which has no clear image).
const PEG_RHYMES = [
  { number: 1, word: 'One', rhyme: 'Bun', icon: '🍔' },
  { number: 2, word: 'Two', rhyme: 'Shoe', icon: '👟' },
  { number: 3, word: 'Three', rhyme: 'Tree', icon: '🌳' },
  { number: 4, word: 'Four', rhyme: 'Door', icon: '🚪' },
  { number: 5, word: 'Five', rhyme: 'Hive', icon: '🐝' },
  { number: 6, word: 'Six', rhyme: 'Sticks', icon: '🥢' },
  { number: 7, word: 'Seven', rhyme: 'Heaven', icon: '😇' },
  { number: 8, word: 'Eight', rhyme: 'Skate', icon: '⛸️' },
  { number: 9, word: 'Nine', rhyme: 'Wine', icon: '🍷' },
  { number: 10, word: 'Ten', rhyme: 'Hen', icon: '🐔' },
];

export default function PegSystemGame({ difficulty, onComplete }: PegSystemGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [showingPegs, setShowingPegs] = useState(true);
  const [words, setWords] = useState<string[]>([]);
  const [currentPegIndex, setCurrentPegIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [askedPegs, setAskedPegs] = useState<number[]>([]);
  const [currentAskedPeg, setCurrentAskedPeg] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ peg: (typeof PEG_RHYMES)[number]; word: string; correct: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { itemCount: 5, memorizeTime: 5 },
    Intermediate: { itemCount: 8, memorizeTime: 3 },
    Advanced: { itemCount: 10, memorizeTime: 2 }
  };

  const { itemCount, memorizeTime } = config[difficulty];
  const pegs = PEG_RHYMES.slice(0, itemCount);

  useEffect(() => {
    if (phase === 'memorize' && !showingPegs && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && !showingPegs && timeLeft === 0 && currentPegIndex < words.length - 1) {
      setCurrentPegIndex(currentPegIndex + 1);
      setTimeLeft(memorizeTime);
    } else if (phase === 'memorize' && !showingPegs && timeLeft === 0 && currentPegIndex === words.length - 1) {
      setPhase('recall');
      generateAskedPegs();
    }
  }, [phase, showingPegs, timeLeft, currentPegIndex, words.length, memorizeTime]);

  const startGame = () => {
    setShowingPegs(true);
    setPhase('memorize');
  };

  const startMemorizing = () => {
    const randomWords = getRandomWords(itemCount);
    setWords(randomWords);
    setShowingPegs(false);
    setCurrentPegIndex(0);
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswers({});
    setLastResult(null);
  };

  const generateAskedPegs = () => {
    // Create shuffled array of peg numbers to ask in random order
    const pegNumbers = pegs.map(p => p.number);
    const shuffled = pegNumbers.sort(() => Math.random() - 0.5);
    setAskedPegs(shuffled);
    setCurrentAskedPeg(shuffled[0]);
  };

  // An empty answer means the player skipped this peg
  const handleSubmitAnswer = (answer: string, skipped = false) => {
    if ((!skipped && !answer.trim()) || currentAskedPeg === null) return;

    const newAnswers = { ...userAnswers, [currentAskedPeg]: skipped ? '' : answer.trim() };
    setUserAnswers(newAnswers);

    const pegIndex = pegs.findIndex(p => p.number === currentAskedPeg);
    const expected = words[pegIndex];
    setLastResult({
      peg: pegs[pegIndex],
      word: expected,
      correct: !skipped && checkAnswer(answer, expected),
    });

    const currentIndex = askedPegs.indexOf(currentAskedPeg);
    if (currentIndex < askedPegs.length - 1) {
      setCurrentAskedPeg(askedPegs[currentIndex + 1]);
    } else {
      finishGame(newAnswers);
    }
  };

  const finishGame = (answers: { [key: number]: string }) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    let correctCount = 0;
    for (let i = 0; i < words.length; i++) {
      const pegNumber = pegs[i].number;
      if (checkAnswer(answers[pegNumber] || '', words[i])) {
        correctCount++;
      }
    }

    const result = calculateScore(correctCount, words.length, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(result.accuracy);

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'peg-system',
      score: result.score,
      accuracy: result.accuracy,
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'peg-system',
      difficulty,
      itemsToMemorize: words,
      userAnswers: Object.values(answers),
      startTime,
      endTime,
      score: result.score,
      accuracy: result.accuracy
    };
    saveGameSession(session);

    setPhase('results');
    onComplete(result.score, result.accuracy);
  };

  const resetGame = () => {
    setPhase('intro');
    setShowingPegs(true);
    setWords([]);
    setCurrentPegIndex(0);
    setUserAnswers({});
    setAskedPegs([]);
    setCurrentAskedPeg(null);
    setTimeLeft(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">📌</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Peg System
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Use rhyming pegs to remember items! 1=Bun, 2=Shoe, 3=Tree... Link each word to its peg! 🎣
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{itemCount}</div>
              <div className="text-gray-700 font-semibold text-sm">Pegs to Learn</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time per Item</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          🚀 Learn the Pegs!
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && showingPegs) {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🎓</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-emerald-600">
            Learn Your Pegs First!
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Each number rhymes with a picture. Learn them once and you can use them forever.
        </p>

        <ol className={`grid gap-2 sm:gap-3 mb-6 max-w-2xl mx-auto text-left ${pegs.length > 5 ? 'sm:grid-cols-2' : ''}`}>
          {pegs.map((peg) => (
            <li
              key={peg.number}
              className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white tabular-nums">
                {peg.number}
              </span>
              <span className="flex-1 text-lg text-slate-500">
                {peg.word} <span aria-hidden="true" className="text-slate-300">→</span>
                <span className="sr-only">rhymes with</span>{' '}
                <span className="font-bold text-slate-900">{peg.rhyme}</span>
              </span>
              <span className="text-3xl" aria-hidden="true">{peg.icon}</span>
            </li>
          ))}
        </ol>

        <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-8">
          <strong className="text-slate-800">Tip:</strong> say them out loud a couple of times: &quot;one is bun, two is shoe, three is tree…&quot;
        </p>

        <button
          onClick={startMemorizing}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          ✓ Got it! Let's Memorize!
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && !showingPegs) {
    const currentPeg = pegs[currentPegIndex];
    const currentWord = words[currentPegIndex];

    return (
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Peg {currentPegIndex + 1} of {words.length} 📌
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentPegIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-8 md:p-12 mb-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-white border border-slate-200 pl-2 pr-5 py-2 mb-8 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {currentPeg.number}
            </span>
            <span className="text-3xl" aria-hidden="true">{currentPeg.icon}</span>
            <span className="text-lg font-bold text-slate-900">{currentPeg.rhyme}</span>
          </div>

          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 break-words px-2">
            {currentWord}
          </div>

          <div className="inline-block bg-slate-900 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4">
            <div className="text-4xl sm:text-5xl font-bold">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-slate-200">
          <p className="text-gray-800 font-bold text-lg">
            ✨ Picture "{currentWord}" with a {currentPeg.rhyme}! ✨
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Make it CRAZY! The weirder, the better you'll remember!
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    const answeredCount = Object.keys(userAnswers).length;
    const currentPeg = currentAskedPeg ? pegs.find(p => p.number === currentAskedPeg) : null;

    return (
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🤔</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            Recall from Pegs!
          </span>
        </h2>
        <div className="bg-emerald-50 rounded-full px-6 py-3 mb-8 text-center border-2 border-green-300">
          <p className="text-gray-800 font-bold text-lg">
            {answeredCount} / {words.length} pegs recalled! 🎯
          </p>
        </div>

        {lastResult && (
          <div
            key={lastResult.peg.number}
            role="status"
            className={`mb-4 rounded-xl px-4 py-3 text-center text-sm font-semibold animate-fade-up ${
              lastResult.correct
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {lastResult.correct
              ? `✅ Correct! ${lastResult.peg.rhyme} was holding "${lastResult.word}".`
              : `❌ ${lastResult.peg.rhyme} was holding "${lastResult.word}".`}
          </div>
        )}

        {currentPeg && (
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 sm:p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl sm:text-7xl mb-3" aria-hidden="true">{currentPeg.icon}</div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900">
                {currentPeg.number} = {currentPeg.rhyme}
              </div>
              <p className="text-slate-600 font-semibold mt-3">
                What word did you link to the {currentPeg.rhyme.toLowerCase()}?
              </p>
            </div>

            <form
              key={currentPeg.number}
              onSubmit={(e) => {
                e.preventDefault();
                const answer = new FormData(e.currentTarget).get('answer');
                handleSubmitAnswer(typeof answer === 'string' ? answer : '');
              }}
            >
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  name="answer"
                  aria-label={`Word linked to peg ${currentPeg.number}, ${currentPeg.rhyme}`}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="flex-1 min-w-0 min-h-[52px] px-4 sm:px-6 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-base sm:text-lg font-bold bg-white"
                  placeholder="Type the word…"
                  autoFocus
                />
                <button
                  type="submit"
                  className="min-h-[52px] bg-blue-600 text-white px-5 sm:px-8 rounded-xl font-bold text-sm sm:text-base hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Check
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSubmitAnswer('', true)}
                className="mt-2 w-full min-h-[44px] text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                I don&apos;t remember, skip this one
              </button>
            </form>
          </div>
        )}

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border-2 border-blue-200">
          <p className="text-gray-700 text-sm text-center">
            <strong>Hint:</strong> Think about the crazy image you created with the {currentPeg?.rhyme}!
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const results = pegs.map((peg, index) => ({
      peg: `${peg.number} = ${peg.rhyme}`,
      icon: peg.icon,
      word: words[index],
      userAnswer: userAnswers[peg.number] || '',
      correct: checkAnswer(userAnswers[peg.number] || '', words[index])
    }));

    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="text-7xl mb-6 animate-float">
          {isGreat ? '🎉' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-2">
          <span className="text-slate-900">
            {isGreat ? 'Fantastic!' : isGood ? 'Great Job!' : 'Keep Going!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'ve mastered the peg system! 📌' : isGood ? 'Your pegs are getting stronger! ⭐' : 'Practice makes perfect! 🌟'}
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

        <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-blue-200 mb-8 text-left">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="text-3xl">📊</span>
            <h3 className="font-bold text-gray-900 text-2xl">Your Peg Results</h3>
          </div>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-2xl shadow-md border-2 transition-transform ${
                  result.correct
                    ? 'bg-emerald-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="text-4xl">{result.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-600">{result.peg}</div>
                  <div className="text-gray-900 font-bold text-lg">{result.word}</div>
                  {!result.correct && (
                    <div className="text-sm text-red-700 font-semibold mt-1">
                      You wrote: {result.userAnswer || '(nothing)'}
                    </div>
                  )}
                </div>
                {result.correct ? (
                  <div className="text-3xl">✅</div>
                ) : (
                  <div className="text-3xl">❌</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            🔄 Try Again!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
