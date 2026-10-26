'use client';

import { useState, useEffect } from 'react';
import { DifficultyLevel, GamePhase } from '@/types';
import { calculateScore, saveHighScore, saveGameSession } from '@/lib/storage';

interface PAOSystemGameProps {
  difficulty: DifficultyLevel;
  onComplete: (score: number, accuracy: number) => void;
}

// Simplified PAO system - only 10 numbers instead of 100!
const PAO_SYSTEM = [
  { number: '00', person: 'Superhero', action: 'Flying', object: 'Cape', emoji: '🦸', color: 'from-red-400 to-red-600' },
  { number: '11', person: 'Chef', action: 'Cooking', object: 'Pan', emoji: '👨‍🍳', color: 'from-orange-400 to-orange-600' },
  { number: '22', person: 'Dancer', action: 'Dancing', object: 'Shoes', emoji: '💃', color: 'from-rose-400 to-rose-600' },
  { number: '33', person: 'Musician', action: 'Playing', object: 'Guitar', emoji: '🎸', color: 'from-lime-400 to-lime-600' },
  { number: '44', person: 'Athlete', action: 'Running', object: 'Medal', emoji: '🏃', color: 'from-blue-400 to-blue-600' },
  { number: '55', person: 'Artist', action: 'Painting', object: 'Brush', emoji: '🎨', color: 'from-green-400 to-green-600' },
  { number: '66', person: 'Scientist', action: 'Mixing', object: 'Flask', emoji: '🧪', color: 'from-cyan-400 to-cyan-600' },
  { number: '77', person: 'Magician', action: 'Waving', object: 'Wand', emoji: '🪄', color: 'from-sky-400 to-sky-600' },
  { number: '88', person: 'Pirate', action: 'Sailing', object: 'Ship', emoji: '🏴‍☠️', color: 'from-yellow-400 to-yellow-600' },
  { number: '99', person: 'Robot', action: 'Beeping', object: 'Antenna', emoji: '🤖', color: 'from-gray-400 to-gray-600' },
];

export default function PAOSystemGame({ difficulty, onComplete }: PAOSystemGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [showingSystem, setShowingSystem] = useState(true);
  const [targetSequence, setTargetSequence] = useState('');
  const [paoComponents, setPaoComponents] = useState<{ person: string; action: string; object: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const config = {
    Beginner: { rounds: 3, sequenceLength: 4, memorizeTime: 10 },
    Intermediate: { rounds: 5, sequenceLength: 4, memorizeTime: 8 },
    Advanced: { rounds: 5, sequenceLength: 6, memorizeTime: 10 }
  };

  const { rounds, sequenceLength, memorizeTime } = config[difficulty];

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
    // Generate random sequence using our PAO numbers
    let sequence = '';
    const availableNumbers = PAO_SYSTEM.map(p => p.number);

    for (let i = 0; i < sequenceLength / 2; i++) {
      const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      sequence += randomNumber;
    }

    setTargetSequence(sequence);

    // Create PAO breakdown
    const firstPair = sequence.substring(0, 2);
    const secondPair = sequence.substring(2, 4);
    const thirdPair = sequenceLength === 6 ? sequence.substring(4, 6) : null;

    const person = PAO_SYSTEM.find(p => p.number === firstPair);
    const action = PAO_SYSTEM.find(p => p.number === secondPair);
    const object = thirdPair ? PAO_SYSTEM.find(p => p.number === thirdPair) : null;

    setPaoComponents({
      person: person?.person || '',
      action: action?.action || '',
      object: object?.object || (action?.object || '')
    });

    setShowingSystem(false);
    setTimeLeft(memorizeTime);
    setStartTime(Date.now());
    setUserAnswer('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    // Simple validation - just check if they typed the number
    const cleanedAnswer = userAnswer.replace(/\s/g, '');
    const isCorrect = cleanedAnswer === targetSequence;

    if (isCorrect) {
      setCorrectRounds(correctRounds + 1);
    }

    const newRoundsCompleted = roundsCompleted + 1;
    setRoundsCompleted(newRoundsCompleted);

    if (newRoundsCompleted >= totalRounds) {
      finishGame(isCorrect ? correctRounds + 1 : correctRounds, totalRounds);
    } else {
      setTimeout(() => {
        setPhase('memorize');
        setShowingSystem(false);
        startRound();
      }, 2000);
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
      tacticId: 'pao-system',
      score: result.score,
      accuracy: Math.round(accuracyValue),
      difficulty,
      timestamp: Date.now()
    };
    saveHighScore(highScore);

    const session = {
      tacticId: 'pao-system',
      difficulty,
      itemsToMemorize: [targetSequence],
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
    setShowingSystem(true);
    setTargetSequence('');
    setPaoComponents(null);
    setUserAnswer('');
    setTimeLeft(0);
    setRoundsCompleted(0);
    setCorrectRounds(0);
    setScore(0);
    setAccuracy(0);
  };

  if (phase === 'intro') {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">👤</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">
            PAO System
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Person-Action-Object! Create clear mental scenes from numbers! 🎬
        </p>
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border-2 border-blue-200 shadow-lg">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold mb-4">
            {difficulty} Mode - Simplified
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{rounds}</div>
              <div className="text-gray-700 font-semibold text-sm">Rounds</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{sequenceLength}</div>
              <div className="text-gray-700 font-semibold text-sm">Digits</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          🎓 Learn PAO!
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && showingSystem) {
    return (
      <div className="text-center relative z-10">
        <div className="text-6xl mb-6 animate-float">🎭</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="text-emerald-600">
            Your PAO Characters
          </span>
        </h2>
        <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto font-medium">
          Each 2-digit number = a Person with an Action and Object!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-6xl mx-auto">
          {PAO_SYSTEM.map((item) => (
            <div
              key={item.number}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 shadow-sm border-2 border-white transition-transform`}
            >
              <div className="text-5xl mb-3">{item.emoji}</div>
              <div className="text-2xl font-bold text-white mb-1">{item.number}</div>
              <div className="text-sm font-bold text-white">{item.person}</div>
              <div className="text-xs text-white/80 mt-1">{item.action}</div>
              <div className="text-xs text-white/80">{item.object}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 max-w-3xl mx-auto border-2 border-blue-200 mb-8">
          <p className="text-gray-800 font-bold text-lg mb-2">
            💡 Example: <strong>112233</strong>
          </p>
          <p className="text-gray-700 text-sm">
            = Chef (11) + Dancing (22) + Guitar (33)<br />
            = "Chef dancing with a guitar!" 🎸
          </p>
        </div>

        <button
          onClick={startRound}
          className="bg-blue-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          ✓ Ready! Start Round {roundsCompleted + 1}
        </button>
      </div>
    );
  }

  if (phase === 'memorize' && !showingSystem && paoComponents) {
    return (
      <div className="text-center relative z-10">
        <div className="mb-6">
          <div className="text-sm font-bold text-gray-700 mb-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 inline-block">
            Round {roundsCompleted + 1} of {totalRounds} 🎬
          </div>
        </div>

        <div className="bg-blue-50 rounded-3xl p-12 shadow-sm border-2 border-blue-300 mb-8">
          <div className="text-sm font-bold text-gray-700 mb-4">Remember this scene:</div>

          <div className="bg-white/90 backdrop-blur rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 mb-6">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-4 md:mb-6 break-words px-2">
              {paoComponents.person} {paoComponents.action} {paoComponents.object}!
            </div>
            <div className="text-gray-600 text-sm sm:text-base md:text-lg">
              Create a clear mental picture of this scene!
            </div>
          </div>

          <div className="bg-blue-100 rounded-2xl p-4 sm:p-6 mb-6">
            <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2">This represents:</div>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 tracking-widest break-all">
              {targetSequence}
            </div>
          </div>

          <div className="inline-block bg-slate-900 text-white rounded-full px-8 py-4">
            <div className="text-4xl font-bold">
              {timeLeft}s
            </div>
          </div>
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
            What Was The Number?
          </span>
        </h2>

        {paoComponents && (
          <div className="bg-amber-50 rounded-3xl p-8 shadow-sm border-2 border-amber-200 mb-6">
            <div className="text-sm font-bold text-gray-700 mb-2">The scene was:</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {paoComponents.person} {paoComponents.action} {paoComponents.object}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-200 mb-6">
            <label className="block text-gray-700 font-bold mb-4 text-lg">
              Type the {sequenceLength}-digit number:
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-6 py-4 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-3xl font-bold text-center tracking-widest"
              placeholder="______"
              maxLength={sequenceLength}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            ✓ Submit Answer
          </button>
        </form>
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
            {isGreat ? 'Amazing!' : isGood ? 'Great Work!' : 'Keep Going!'}
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
            <strong>Pro tip:</strong> Champions build a full 100-person PAO system! This simplified version uses just 10 to get you started. 🎬
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
