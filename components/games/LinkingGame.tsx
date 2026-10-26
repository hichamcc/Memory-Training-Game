'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { getRandomWords, checkAnswer } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface LinkingGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

export default function LinkingGame({ difficulty, onComplete }: LinkingGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { itemCount: 5, memorizeTime: 5 },
    Intermediate: { itemCount: 8, memorizeTime: 3 },
    Advanced: { itemCount: 12, memorizeTime: 2 }
  };

  const { itemCount, memorizeTime } = config[difficulty];

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0 && currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setTimeLeft(memorizeTime);
    } else if (phase === 'memorize' && timeLeft === 0 && currentWordIndex === words.length - 1) {
      setPhase('recall');
      setCurrentWordIndex(0);
    }
  }, [phase, timeLeft, currentWordIndex, words.length, memorizeTime]);

  const startGame = () => {
    const randomWords = getRandomWords(itemCount);
    setWords(randomWords);
    setPhase('memorize');
    setCurrentWordIndex(0);
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswers([]);
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const newAnswers = [...userAnswers, currentInput.trim()];
    setUserAnswers(newAnswers);
    setCurrentInput('');

    if (newAnswers.length === words.length) {
      finishGame(newAnswers);
    }
  };

  const finishGame = (answers: string[]) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    let correctCount = 0;
    for (let i = 0; i < words.length; i++) {
      if (checkAnswer(answers[i] || '', words[i])) {
        correctCount++;
      }
    }

    const result = calculateScore(correctCount, words.length, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(result.accuracy);

    // Save to localStorage
    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'linking-method',
      score: result.score,
      accuracy: result.accuracy,
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'linking-method',
      difficulty,
      itemsToMemorize: words,
      userAnswers: answers,
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
    setWords([]);
    setCurrentWordIndex(0);
    setUserAnswers([]);
    setCurrentInput('');
    setTimeLeft(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🧠</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Link & Remember
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          You'll see {itemCount} words one at a time. Create crazy connections between them!
          The weirder, the better! 🎨
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{itemCount}</div>
              <div className="text-gray-700 font-semibold text-sm">Words to Remember</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time per Word</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          🚀 Let's Go!
        </button>
      </div>
    );
  }

  if (phase === 'memorize') {
    return (
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Word {currentWordIndex + 1} of {words.length} 📚
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl md:rounded-3xl p-8 sm:p-12 md:p-16 shadow-sm border-2 border-amber-200 mb-8 transition-transform">
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 mb-6 break-words px-2">
            {words[currentWordIndex]}
          </div>
          <div className="inline-block bg-slate-900 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4">
            <div className="text-4xl sm:text-5xl font-bold">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-slate-200">
          <p className="text-gray-800 font-bold text-lg">
            ✨ Create a CRAZY mental image! ✨
          </p>
          <p className="text-gray-600 text-sm mt-2">
            The weirder and more detailed, the better you'll remember!
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🤔</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            Recall Time!
          </span>
        </h2>
        <div className="bg-emerald-50 rounded-full px-6 py-3 mb-8 text-center border-2 border-green-300 inline-block w-full">
          <p className="text-gray-800 font-bold text-lg">
            {userAnswers.length} / {words.length} words remembered! 🎯
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-green-200 mb-6">
          {userAnswers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-3">👇</div>
              <p className="font-semibold">Start typing your first word below!</p>
            </div>
          ) : (
            userAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-4 mb-3 bg-white rounded-2xl p-4 shadow-sm border-2 border-green-300 transition-transform">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <div className="text-gray-900 font-bold text-lg">{answer}</div>
                <div className="ml-auto text-2xl">✅</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmitAnswer} className="mb-6">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-base sm:text-lg font-bold shadow-lg bg-white"
              placeholder={`Word ${userAnswers.length + 1}... 💭`}
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 sm:px-7 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              ✓ Submit
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (phase === 'results') {
    const results = words.map((word, index) => ({
      word,
      userAnswer: userAnswers[index] || '',
      correct: checkAnswer(userAnswers[index] || '', word)
    }));

    const correctCount = results.filter(r => r.correct).length;
    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="text-7xl mb-6 animate-float">
          {isGreat ? '🎉' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-2">
          <span className="text-slate-900">
            {isGreat ? 'Amazing!' : isGood ? 'Well Done!' : 'Keep Trying!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'re a memory champion! 🏆' : isGood ? 'Nice work! Practice makes perfect! ⭐' : 'Every attempt makes you better! 🌟'}
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
            <h3 className="font-bold text-gray-900 text-2xl">Your Results</h3>
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                  result.correct
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
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
            🔄 Play Again!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
