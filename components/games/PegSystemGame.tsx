'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { getRandomWords, checkAnswer } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface PegSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// The classic peg system rhymes
const PEG_RHYMES = [
  { number: 1, rhyme: 'Bun', icon: '🍔', color: 'from-yellow-400 to-orange-500' },
  { number: 2, rhyme: 'Shoe', icon: '👟', color: 'from-blue-400 to-blue-600' },
  { number: 3, rhyme: 'Tree', icon: '🌳', color: 'from-green-400 to-green-600' },
  { number: 4, rhyme: 'Door', icon: '🚪', color: 'from-brown-400 to-brown-600' },
  { number: 5, rhyme: 'Hive', icon: '🐝', color: 'from-yellow-400 to-yellow-600' },
  { number: 6, rhyme: 'Sticks', icon: '🥢', color: 'from-amber-400 to-amber-600' },
  { number: 7, rhyme: 'Heaven', icon: '☁️', color: 'from-sky-400 to-sky-600' },
  { number: 8, rhyme: 'Gate', icon: '🚧', color: 'from-gray-400 to-gray-600' },
  { number: 9, rhyme: 'Wine', icon: '🍷', color: 'from-purple-400 to-purple-600' },
  { number: 10, rhyme: 'Hen', icon: '🐔', color: 'from-red-400 to-red-600' },
];

export default function PegSystemGame({ difficulty, onComplete }: PegSystemGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [showingPegs, setShowingPegs] = useState(true);
  const [words, setWords] = useState<string[]>([]);
  const [currentPegIndex, setCurrentPegIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [askedPegs, setAskedPegs] = useState<number[]>([]);
  const [currentAskedPeg, setCurrentAskedPeg] = useState<number | null>(null);
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
  };

  const generateAskedPegs = () => {
    // Create shuffled array of peg numbers to ask in random order
    const pegNumbers = pegs.map(p => p.number);
    const shuffled = pegNumbers.sort(() => Math.random() - 0.5);
    setAskedPegs(shuffled);
    setCurrentAskedPeg(shuffled[0]);
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!answer.trim() || currentAskedPeg === null) return;

    const newAnswers = { ...userAnswers, [currentAskedPeg]: answer.trim() };
    setUserAnswers(newAnswers);

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
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Peg System
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Use rhyming pegs to remember items! 1=Bun, 2=Shoe, 3=Tree... Link each word to its peg! 🎣
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-black mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-purple-600 mb-1">{itemCount}</div>
              <div className="text-gray-700 font-semibold text-sm">Pegs to Learn</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time per Item</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
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
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Learn Your Pegs First!
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Memorize these rhyming pegs - you'll use them to remember your items!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto">
          {pegs.map((peg) => (
            <div
              key={peg.number}
              className={`bg-gradient-to-br ${peg.color} rounded-2xl p-6 shadow-xl border-2 border-white transform hover:scale-105 transition-transform`}
            >
              <div className="text-5xl mb-3">{peg.icon}</div>
              <div className="text-3xl font-black text-white mb-1">{peg.number}</div>
              <div className="text-lg font-bold text-white">{peg.rhyme}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-blue-200 mb-8">
          <p className="text-gray-800 font-bold text-lg mb-2">
            ✨ Say them out loud: "One is Bun, Two is Shoe, Three is Tree..." ✨
          </p>
          <p className="text-gray-600 text-sm">
            These pegs will help you remember items by position!
          </p>
        </div>

        <button
          onClick={startMemorizing}
          className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
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
          <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentPegIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={`bg-gradient-to-br ${currentPeg.color} rounded-3xl p-12 shadow-2xl border-4 border-white/50 mb-8`}>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-8 mb-6">
            <div className="text-7xl mb-4">{currentPeg.icon}</div>
            <div className="text-2xl font-black text-gray-700 mb-2">
              {currentPeg.number} = {currentPeg.rhyme}
            </div>
          </div>

          <div className="text-7xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-pulse">
            {currentWord}
          </div>

          <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-8 py-4">
            <div className="text-5xl font-black animate-pulse">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-purple-200">
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
        <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Recall from Pegs!
          </span>
        </h2>
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-8 text-center border-2 border-green-300">
          <p className="text-gray-800 font-black text-lg">
            {answeredCount} / {words.length} pegs recalled! 🎯
          </p>
        </div>

        {currentPeg && (
          <div className={`bg-gradient-to-br ${currentPeg.color} rounded-3xl p-8 shadow-2xl border-4 border-white mb-8`}>
            <div className="bg-white/90 backdrop-blur rounded-2xl p-8 mb-6 text-center">
              <div className="text-7xl mb-4">{currentPeg.icon}</div>
              <div className="text-4xl font-black text-gray-900 mb-2">
                {currentPeg.number} = {currentPeg.rhyme}
              </div>
              <p className="text-gray-600 font-semibold mt-4">
                What word did you link to this peg?
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              handleSubmitAnswer(input.value);
              input.value = '';
            }}>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 px-8 py-5 rounded-full border-3 border-white focus:border-yellow-300 focus:outline-none text-lg font-bold shadow-lg bg-white"
                  placeholder="Type the word... 💭"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-10 py-5 rounded-full font-black hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl"
                >
                  ✓ Submit
                </button>
              </div>
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
        <h2 className="text-5xl font-black text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {isGreat ? 'Fantastic!' : isGood ? 'Great Job!' : 'Keep Going!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'ve mastered the peg system! 📌' : isGood ? 'Your pegs are getting stronger! ⭐' : 'Practice makes perfect! 🌟'}
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

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-8 text-left">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="text-3xl">📊</span>
            <h3 className="font-black text-gray-900 text-2xl">Your Peg Results</h3>
          </div>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-2xl shadow-md border-2 transform hover:scale-105 transition-transform ${
                  result.correct
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                    : 'bg-gradient-to-r from-red-100 to-pink-100 border-red-300'
                }`}
              >
                <div className="text-4xl">{result.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-600">{result.peg}</div>
                  <div className="text-gray-900 font-black text-lg">{result.word}</div>
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
            className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
          >
            🔄 Try Again!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
