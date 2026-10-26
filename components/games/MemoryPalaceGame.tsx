'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { getRandomWords, checkAnswer } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface MemoryPalaceGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Define locations in the memory palace (house)
const PALACE_LOCATIONS = [
  { id: 1, name: 'Front Door', icon: '🚪', color: 'from-blue-400 to-blue-600' },
  { id: 2, name: 'Living Room', icon: '🛋️', color: 'from-green-400 to-green-600' },
  { id: 3, name: 'Kitchen', icon: '🍳', color: 'from-yellow-400 to-yellow-600' },
  { id: 4, name: 'Bedroom', icon: '🛏️', color: 'from-lime-400 to-lime-600' },
  { id: 5, name: 'Bathroom', icon: '🚿', color: 'from-rose-400 to-rose-600' },
  { id: 6, name: 'Study Room', icon: '📚', color: 'from-orange-400 to-orange-600' },
  { id: 7, name: 'Dining Room', icon: '🍽️', color: 'from-red-400 to-red-600' },
  { id: 8, name: 'Garden', icon: '🌻', color: 'from-teal-400 to-teal-600' },
  { id: 9, name: 'Garage', icon: '🚗', color: 'from-sky-400 to-sky-600' },
  { id: 10, name: 'Balcony', icon: '🌆', color: 'from-cyan-400 to-cyan-600' },
  { id: 11, name: 'Attic', icon: '📦', color: 'from-amber-400 to-amber-600' },
  { id: 12, name: 'Basement', icon: '🔦', color: 'from-slate-400 to-slate-600' },
];

export default function MemoryPalaceGame({ difficulty, onComplete }: MemoryPalaceGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { itemCount: 5, memorizeTime: 6 },
    Intermediate: { itemCount: 8, memorizeTime: 4 },
    Advanced: { itemCount: 12, memorizeTime: 3 }
  };

  const { itemCount, memorizeTime } = config[difficulty];
  const locations = PALACE_LOCATIONS.slice(0, itemCount);

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0 && currentLocationIndex < words.length - 1) {
      setCurrentLocationIndex(currentLocationIndex + 1);
      setTimeLeft(memorizeTime);
    } else if (phase === 'memorize' && timeLeft === 0 && currentLocationIndex === words.length - 1) {
      setPhase('recall');
      setSelectedLocation(null);
    }
  }, [phase, timeLeft, currentLocationIndex, words.length, memorizeTime]);

  const startGame = () => {
    const randomWords = getRandomWords(itemCount);
    setWords(randomWords);
    setPhase('memorize');
    setCurrentLocationIndex(0);
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswers({});
  };

  const handleLocationClick = (locationId: number) => {
    if (userAnswers[locationId] !== undefined) return; // Already answered
    setSelectedLocation(locationId);
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!answer.trim() || selectedLocation === null) return;

    const newAnswers = { ...userAnswers, [selectedLocation]: answer.trim() };
    setUserAnswers(newAnswers);
    setSelectedLocation(null);

    if (Object.keys(newAnswers).length === words.length) {
      finishGame(newAnswers);
    }
  };

  const finishGame = (answers: { [key: number]: string }) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    let correctCount = 0;
    for (let i = 0; i < words.length; i++) {
      const locationId = locations[i].id;
      if (checkAnswer(answers[locationId] || '', words[i])) {
        correctCount++;
      }
    }

    const result = calculateScore(correctCount, words.length, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(result.accuracy);

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'memory-palace',
      score: result.score,
      accuracy: result.accuracy,
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'memory-palace',
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
    setWords([]);
    setCurrentLocationIndex(0);
    setUserAnswers({});
    setSelectedLocation(null);
    setTimeLeft(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🏛️</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Memory Palace
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Place each word in a specific room of your house. Walk through your palace to remember! 🏠
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{itemCount}</div>
              <div className="text-gray-700 font-semibold text-sm">Locations</div>
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
          🚀 Enter Your Palace!
        </button>
      </div>
    );
  }

  if (phase === 'memorize') {
    const currentLocation = locations[currentLocationIndex];
    const currentWord = words[currentLocationIndex];

    return (
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Location {currentLocationIndex + 1} of {words.length} 🏠
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentLocationIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={`bg-gradient-to-br ${currentLocation.color} rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border-2 border-white/50 mb-8 transition-transform`}>
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4">{currentLocation.icon}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg break-words px-2">
            {currentLocation.name}
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 sm:p-6 md:p-8 mb-6">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 mb-4 break-words px-2">
              {currentWord}
            </div>
          </div>
          <div className="inline-block bg-slate-900 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4">
            <div className="text-4xl sm:text-5xl font-bold">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-slate-200">
          <p className="text-gray-800 font-bold text-lg">
            ✨ Imagine "{currentWord}" in the {currentLocation.name}! ✨
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Create a clear mental image of this item in this specific location!
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🚶</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            Walk Through Your Palace!
          </span>
        </h2>
        <div className="bg-emerald-50 rounded-full px-6 py-3 mb-8 text-center border-2 border-green-300">
          <p className="text-gray-800 font-bold text-lg">
            {Object.keys(userAnswers).length} / {words.length} locations recalled! 🎯
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {locations.map((location) => {
            const isAnswered = userAnswers[location.id] !== undefined;
            const isSelected = selectedLocation === location.id;

            return (
              <button
                key={location.id}
                onClick={() => handleLocationClick(location.id)}
                disabled={isAnswered}
                className={`p-6 rounded-2xl border-2 transition-all transform ${
                  isAnswered
                    ? 'bg-emerald-50 border-green-400 cursor-default opacity-75'
                    : isSelected
                    ? `bg-gradient-to-br ${location.color} border-white scale-105 shadow-sm`
                    : `bg-white border-gray-300 hover:border-orange-400 hover:shadow-lg`
                }`}
              >
                <div className={`text-5xl mb-3 ${isSelected ? 'animate-bounce' : ''}`}>
                  {location.icon}
                </div>
                <div className={`font-bold text-sm ${isAnswered ? 'text-green-700' : isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {location.name}
                </div>
                {isAnswered && (
                  <div className="mt-2 text-2xl">✅</div>
                )}
              </button>
            );
          })}
        </div>

        {selectedLocation !== null && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-orange-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{locations.find(l => l.id === selectedLocation)?.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900">
                What's in the {locations.find(l => l.id === selectedLocation)?.name}?
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              handleSubmitAnswer(input.value);
              input.value = '';
            }}>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-full border-2 border-orange-300 focus:border-orange-500 focus:outline-none text-base sm:text-lg font-bold shadow-lg bg-white"
                  placeholder="Type the word... 💭"
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
        )}
      </div>
    );
  }

  if (phase === 'results') {
    const results = locations.map((location, index) => ({
      location: location.name,
      icon: location.icon,
      word: words[index],
      userAnswer: userAnswers[location.id] || '',
      correct: checkAnswer(userAnswers[location.id] || '', words[index])
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
            {isGreat ? 'Amazing!' : isGood ? 'Well Done!' : 'Keep Trying!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You\'re a memory palace master! 🏛️' : isGood ? 'Nice work! Your palace is growing! ⭐' : 'Keep building your palace! 🌟'}
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
            <h3 className="font-bold text-gray-900 text-2xl">Your Palace Journey</h3>
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
                  <div className="text-sm font-bold text-gray-600">{result.location}</div>
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
            🔄 Visit Again!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
