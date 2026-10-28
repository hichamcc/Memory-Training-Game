'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { shuffleArray } from '@/lib/gameLogic';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface FaceNameGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// People with distinctive features (real photos). Each feature must be clearly
// visible in its photo, since players are told to link the name to it.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces`;

const PEOPLE_DATABASE = [
  { id: 1, name: 'Lucas', feature: 'Curly Hair', imageUrl: photo('1568602471122-7832951cc4c5'), description: 'Has a big mop of curly hair and a beard', sport: '⚽' },
  { id: 2, name: 'James', feature: 'Bright Smile', imageUrl: photo('1507003211169-0a1dd7228f2d'), description: 'Flashes a wide, bright smile', sport: '🎾' },
  { id: 3, name: 'Thomas', feature: 'Slicked-Back Hair', imageUrl: photo('1500648767791-00dcc994a43e'), description: 'Wears his dark hair slicked back', sport: '⚽' },
  { id: 4, name: 'Daniel', feature: 'Messy Hair', imageUrl: photo('1506794778202-cad84cf45f1d'), description: 'Has tousled hair and light stubble', sport: '🎾' },
  { id: 5, name: 'Andre', feature: 'Black Cap', imageUrl: photo('1564564321837-a57b7070ac4f'), description: 'Always wears a black cap', sport: '⚽' },
  { id: 6, name: 'Marco', feature: 'Chunky Scarf', imageUrl: photo('1527980965255-d3b416303d12'), description: 'Wrapped up in a thick grey scarf', sport: '🎾' },
  { id: 7, name: 'Viktor', feature: 'Tall Quiff', imageUrl: photo('1535713875002-d1d0cf377fde'), description: 'Has his hair styled up in a tall quiff', sport: '⚽' },
  { id: 8, name: 'Kevin', feature: 'Black Hat', imageUrl: photo('1539571696357-5a69c17a67c6'), description: 'Wears a wide black hat over his curls', sport: '🎾' },
  { id: 9, name: 'Stefan', feature: 'Goatee', imageUrl: photo('1547425260-76bcadfb4f2c'), description: 'Has a dark goatee and glasses', sport: '⚽' },
  { id: 10, name: 'Rafael', feature: 'Light Hair', imageUrl: photo('1570295999919-56ceb5ecca61'), description: 'Has short, light brown hair swept up', sport: '🎾' },
  { id: 11, name: 'Erik', feature: 'Ginger Beard', imageUrl: photo('1599566150163-29194dcaad36'), description: 'Has a full ginger beard and glasses', sport: '⚽' },
  { id: 12, name: 'Noah', feature: 'Round Glasses', imageUrl: photo('1633332755192-727a05c4013d'), description: 'Wears round wire glasses', sport: '🎾' },
  { id: 13, name: 'Sofia', feature: 'Long Wavy Hair', imageUrl: photo('1544005313-94ddf0286df2'), description: 'Has long, wavy brown hair', sport: '⚽' },
];

function isCorrectName(answer: string | undefined, name: string) {
  return (answer ?? '').toLowerCase().trim() === name.toLowerCase().trim();
}

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

  // An empty name means the player skipped this face
  const handleSubmitAnswer = (personId: number, name: string, skipped = false) => {
    if (!skipped && !name.trim()) return;

    const newAnswers = { ...userAnswers, [personId]: skipped ? '' : name.trim() };
    setUserAnswers(newAnswers);

    if (Object.keys(newAnswers).length === people.length) {
      // Short pause so the feedback on the last card is visible
      setTimeout(() => finishGame(newAnswers), 1200);
    }
  };

  const finishGame = (answers: { [key: number]: string }) => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    const correctCount = people.filter((person) => isCorrectName(answers[person.id], person.name)).length;

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
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            Face-Name Match
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Link facial features to names! Perfect for networking events! 👤
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{peopleCount}</div>
              <div className="text-gray-700 font-semibold text-sm">People to Meet</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{memorizeTime}s</div>
              <div className="text-gray-700 font-semibold text-sm">Time per Person</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
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
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentPersonIndex + 1) / people.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-3xl p-12 shadow-sm border-2 border-blue-300 mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-sm ring-4 ring-white">
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
            <div className="text-5xl font-bold text-blue-600 mb-3">
              {currentPerson.name}
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl px-8 py-4 inline-block">
              <div className="text-xl font-bold text-gray-700 mb-1">
                Distinctive Feature:
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentPerson.feature}
              </div>
            </div>
          </div>

          <div className="inline-block bg-slate-900 text-white rounded-full px-8 py-4">
            <div className="text-5xl font-bold">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border-2 border-slate-200">
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
    const answeredCount = Object.keys(userAnswers).length;
    const correctSoFar = people.filter((p) => userAnswers[p.id] !== undefined && isCorrectName(userAnswers[p.id], p.name)).length;

    return (
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-6xl mb-6 text-center animate-float">🎭</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-emerald-600">
            Who's Who?
          </span>
        </h2>
        <p className="text-center text-gray-600 mb-2">
          Type each person&apos;s name and press <strong>Check</strong>. You&apos;ll see right away if you got it.
        </p>
        <div aria-live="polite" className="bg-slate-50 rounded-full px-6 py-3 mb-8 text-center border-2 border-slate-200">
          <p className="text-gray-800 font-bold text-lg">
            {answeredCount} / {people.length} answered
            <span className="mx-2 text-slate-300">·</span>
            <span className="text-emerald-600">{correctSoFar} correct</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {shuffledPeople.map((person) => {
            const hasAnswered = userAnswers[person.id] !== undefined;
            const answer = userAnswers[person.id];
            const correct = hasAnswered && isCorrectName(answer, person.name);

            return (
              <div
                key={person.id}
                className={`rounded-2xl p-3 sm:p-6 border-2 shadow-sm transition-colors ${
                  !hasAnswered
                    ? 'bg-white border-gray-300'
                    : correct
                      ? 'bg-emerald-50 border-emerald-400'
                      : 'bg-red-50 border-red-300'
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
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = new FormData(e.currentTarget).get('name');
                      handleSubmitAnswer(person.id, typeof name === 'string' ? name : '');
                    }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      name="name"
                      aria-label={`Name of the person with ${person.feature.toLowerCase()}`}
                      autoComplete="off"
                      autoCapitalize="words"
                      spellCheck={false}
                      className="w-full min-h-[44px] px-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-sm font-bold text-center"
                      placeholder="Name?"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="submit"
                        className="flex-1 min-h-[40px] rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                      >
                        Check
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(person.id, '', true)}
                        className="min-h-[40px] px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </form>
                ) : correct ? (
                  <div className="text-center animate-fade-up">
                    <div className="text-2xl mb-1" aria-hidden="true">✅</div>
                    <div className="text-lg font-bold text-emerald-700">{person.name}</div>
                    <div className="text-xs font-semibold text-emerald-600">Correct!</div>
                  </div>
                ) : (
                  <div className="text-center animate-fade-up">
                    <div className="text-2xl mb-1" aria-hidden="true">❌</div>
                    <div className="text-sm text-red-600 line-through break-words">
                      {answer || 'Skipped'}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      It&apos;s <span className="font-bold text-slate-900">{person.name}</span>
                    </div>
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
        <h2 className="text-5xl font-bold text-gray-900 mb-2">
          <span className="text-slate-900">
            {isGreat ? 'Superb!' : isGood ? 'Well Done!' : 'Keep Practicing!'}
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 font-semibold">
          {isGreat ? 'You never forget a face! 👥' : isGood ? 'Your name memory is improving! ⭐' : 'Keep associating features with names! 🌟'}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
          <div className="bg-blue-50 rounded-3xl p-5 sm:p-8 shadow-sm border-2 border-blue-300 transition-transform">
            <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-3 tabular-nums">{score}</div>
            <div className="text-gray-800 font-bold text-lg">🎯 Score</div>
          </div>
          <div className="bg-emerald-50 rounded-3xl p-5 sm:p-8 shadow-sm border-2 border-green-300 transition-transform">
            <div className="text-4xl sm:text-6xl font-bold text-emerald-600 mb-3 tabular-nums">{accuracy}%</div>
            <div className="text-gray-800 font-bold text-lg">✓ Accuracy</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-blue-200 mb-8 text-left">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="text-3xl">📊</span>
            <h3 className="font-bold text-gray-900 text-2xl">The People You Met</h3>
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
                  <div className="text-gray-900 font-bold text-lg">{result.person.name}</div>
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
            🔄 Meet More People!
          </button>
        </div>
      </div>
    );
  }

  return null;
}
