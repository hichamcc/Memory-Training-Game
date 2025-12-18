'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { shuffleArray } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface FaceNameGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// People with distinctive features (using real photos)
const PEOPLE_DATABASE = [
  { id: 1, name: 'Alex', feature: 'Curly Hair', imageUrl: 'https://images.unsplash.com/photo-1574626828260-7f4c0e5a0b99?w=400&h=400&fit=crop&crop=faces', description: 'Has distinctive curly blonde hair', sport: '⚽' },
  { id: 2, name: 'James', feature: 'Sharp Features', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces', description: 'Has sharp, defined facial features', sport: '🎾' },
  { id: 3, name: 'Carlos', feature: 'Bright Smile', imageUrl: 'https://images.unsplash.com/photo-1542838686-3e0e2f0e3c6e?w=400&h=400&fit=crop&crop=faces', description: 'Known for his wide, bright smile', sport: '⚽' },
  { id: 4, name: 'Thomas', feature: 'Strong Jawline', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces', description: 'Has a prominent, strong jawline', sport: '🎾' },
  { id: 5, name: 'Marco', feature: 'Beard', imageUrl: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=400&h=400&fit=crop&crop=faces', description: 'Has a distinctive well-groomed beard', sport: '⚽' },
  { id: 6, name: 'Daniel', feature: 'Square Jaw', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces', description: 'Has a strong, square jawline', sport: '🎾' },
  { id: 7, name: 'Andre', feature: 'Shaved Head', imageUrl: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=faces', description: 'Known for his clean-shaven head', sport: '⚽' },
  { id: 8, name: 'Viktor', feature: 'High Forehead', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=faces', description: 'Has a distinctive high forehead', sport: '🎾' },
  { id: 9, name: 'Kevin', feature: 'Wide Eyes', imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop&crop=faces', description: 'Has notably large, expressive eyes', sport: '⚽' },
  { id: 10, name: 'Stefan', feature: 'Chiseled Face', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces', description: 'Has chiseled, well-defined features', sport: '🎾' },
  { id: 11, name: 'Lucas', feature: 'Thick Eyebrows', imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=faces', description: 'Has prominent, dark eyebrows', sport: '⚽' },
  { id: 12, name: 'Rafael', feature: 'Stubble Beard', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces', description: 'Known for his signature stubble', sport: '🎾' },
];

export default function FaceNameGame({ difficulty, onComplete }: FaceNameGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [people, setPeople] = useState<typeof PEOPLE_DATABASE>([]);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [shuffledPeople, setShuffledPeople] = useState<typeof PEOPLE_DATABASE>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { peopleCount: 5, memorizeTime: 6 },
    Intermediate: { peopleCount: 8, memorizeTime: 4 },
    Advanced: { peopleCount: 12, memorizeTime: 3 }
  };

  const { peopleCount, memorizeTime } = config[difficulty];

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0 && currentPersonIndex < people.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
      setTimeLeft(memorizeTime);
    } else if (phase === 'memorize' && timeLeft === 0 && currentPersonIndex === people.length - 1) {
      // Shuffle people for recall phase
      setShuffledPeople(shuffleArray([...people]));
      setPhase('recall');
    }
  }, [phase, timeLeft, currentPersonIndex, people.length, memorizeTime]);

  const startGame = () => {
    // Select random people
    const shuffled = shuffleArray([...PEOPLE_DATABASE]);
    const selectedPeople = shuffled.slice(0, peopleCount);

    setPeople(selectedPeople);
    setPhase('memorize');
    setCurrentPersonIndex(0);
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswers({});
  };

  const handleSubmitAnswer = (personId: number, name: string) => {
    if (!name.trim()) return;

    const newAnswers = { ...userAnswers, [personId]: name.trim() };
    setUserAnswers(newAnswers);

    if (Object.keys(newAnswers).length === people.length) {
      finishGame(newAnswers);
    }
  };

  const finishGame = (answers: { [key: number]: string }) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    let correctCount = 0;
    for (const person of people) {
      const userAnswer = (answers[person.id] || '').toLowerCase().trim();
      const correctAnswer = person.name.toLowerCase().trim();
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    }

    const result = calculateScore(correctCount, people.length, timeElapsed, difficulty);
    setScore(result.score);
    setAccuracy(result.accuracy);

    const highScore = {
      id: `${Date.now()}`,
      tacticId: 'face-name',
      score: result.score,
      accuracy: result.accuracy,
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'face-name',
      difficulty,
      itemsToMemorize: people.map(p => p.name),
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
    setPeople([]);
    setShuffledPeople([]);
    setCurrentPersonIndex(0);
    setUserAnswers({});
    setTimeLeft(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">👥</div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Face-Name Match
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Link facial features to names! Perfect for networking events! 👤
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-black mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-purple-600 mb-1">{peopleCount}</div>
              <div className="text-gray-700 font-semibold text-sm">People to Meet</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-black text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time per Person</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-12 py-5 rounded-full font-black text-xl hover:from-orange-700 hover:to-pink-700 transition-all transform hover:scale-110 shadow-2xl"
        >
          🤝 Meet the People!
        </button>
      </div>
    );
  }

  if (phase === 'memorize') {
    const currentPerson = people[currentPersonIndex];

    return (
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Person {currentPersonIndex + 1} of {people.length} 👤
          </div>
          <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentPersonIndex + 1) / people.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-12 shadow-2xl border-4 border-blue-300 mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl ring-4 ring-white">
            <img
              src={currentPerson.imageUrl}
              alt={currentPerson.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
              <span className="text-2xl">{currentPerson.sport}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-5xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-pulse">
              {currentPerson.name}
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl px-8 py-4 inline-block">
              <div className="text-xl font-bold text-gray-700 mb-1">
                Distinctive Feature:
              </div>
              <div className="text-2xl font-black text-blue-600">
                {currentPerson.feature}
              </div>
            </div>
          </div>

          <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-8 py-4">
            <div className="text-5xl font-black animate-pulse">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-purple-200">
          <p className="text-gray-800 font-bold text-lg">
            ✨ Link {currentPerson.name}'s name to their {currentPerson.feature}! ✨
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {currentPerson.description}
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🎭</div>
        <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Who's Who?
          </span>
        </h2>
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-8 text-center border-2 border-green-300">
          <p className="text-gray-800 font-black text-lg">
            {Object.keys(userAnswers).length} / {people.length} names remembered! 🎯
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shuffledPeople.map((person) => {
            const hasAnswered = userAnswers[person.id] !== undefined;

            return (
              <div
                key={person.id}
                className={`rounded-2xl p-6 border-3 shadow-xl ${
                  hasAnswered
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg ring-2 ring-gray-200">
                  <img
                    src={person.imageUrl}
                    alt="Face to remember"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                    <span className="text-sm">{person.sport}</span>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-gray-600 mb-1">
                    {person.feature}
                  </div>
                </div>

                {!hasAnswered ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
                    handleSubmitAnswer(person.id, input.value);
                  }}>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-sm font-bold text-center"
                      placeholder="Name?"
                    />
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="text-lg font-black text-green-700 mb-2">
                      {userAnswers[person.id]}
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const results = people.map((person) => {
      const userAnswer = (userAnswers[person.id] || '').toLowerCase().trim();
      const correctAnswer = person.name.toLowerCase().trim();
      return {
        person,
        userAnswer: userAnswers[person.id] || '',
        correct: userAnswer === correctAnswer
      };
    });

    const isGreat = accuracy >= 80;
    const isGood = accuracy >= 60;

    return (
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="text-7xl mb-6 animate-float">
          {isGreat ? '🎉' : isGood ? '👏' : '💪'}
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {isGreat ? 'Superb!' : isGood ? 'Well Done!' : 'Keep Practicing!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You never forget a face! 👥' : isGood ? 'Your name memory is improving! ⭐' : 'Keep associating features with names! 🌟'}
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
            <h3 className="font-black text-gray-900 text-2xl">The People You Met</h3>
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
                <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg ring-2 ring-white flex-shrink-0">
                  <img
                    src={result.person.imageUrl}
                    alt={result.person.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <span className="text-xs">{result.person.sport}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-600">{result.person.feature}</div>
                  <div className="text-gray-900 font-black text-lg">{result.person.name}</div>
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
            🔄 Meet More People!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
