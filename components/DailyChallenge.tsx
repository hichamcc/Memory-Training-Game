'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DailyResult } from '@/types';
import { checkAnswer } from '@/lib/gameLogic';
import { calculateScore, saveDailyResult, toDateKey } from '@/lib/storage';
import { useProgress } from '@/lib/useProgress';
import {
  DAILY_SECONDS_PER_WORD,
  DAILY_WORD_COUNT,
  getDailyNumber,
  getDailyWords,
  getShareText,
} from '@/lib/daily';
import { FIRST_TACTIC_ID } from '@/lib/tactics';

type Phase = 'intro' | 'memorize' | 'recall' | 'results';

export default function DailyChallenge() {
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('intro');
  const [dateKey, setDateKey] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DAILY_SECONDS_PER_WORD);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [recallStart, setRecallStart] = useState(0);
  const [result, setResult] = useState<DailyResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memorization: one word every few seconds, then straight into recall
  useEffect(() => {
    if (phase !== 'memorize') return;
    const timer = setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else if (index < words.length - 1) {
        setIndex(index + 1);
        setTimeLeft(DAILY_SECONDS_PER_WORD);
      } else {
        setPhase('recall');
        setRecallStart(Date.now());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, index, words.length]);

  useEffect(() => {
    if (phase === 'recall') inputRef.current?.focus();
  }, [phase, answers.length]);

  const start = () => {
    const today = toDateKey();
    setDateKey(today);
    setWords(getDailyWords(today));
    setIndex(0);
    setTimeLeft(DAILY_SECONDS_PER_WORD);
    setAnswers([]);
    setInput('');
    setPhase('memorize');
  };

  const submitAnswer = (value: string) => {
    const next = [...answers, value.trim()];
    setAnswers(next);
    setInput('');
    if (next.length < words.length) return;

    const marks = words.map((word, i) => checkAnswer(next[i], word));
    const elapsed = Math.floor((Date.now() - recallStart) / 1000);
    const { score, accuracy } = calculateScore(marks.filter(Boolean).length, words.length, elapsed, 'Intermediate');
    const dailyResult = { score, accuracy, marks, timestamp: Date.now() };
    saveDailyResult(dateKey, dailyResult);
    setResult(dailyResult);
    setPhase('results');
  };

  // Wait for localStorage before deciding between "play" and "already played"
  if (phase === 'intro' && progress === null) {
    return <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" aria-hidden="true" />;
  }

  if (phase === 'intro' && progress?.dailyToday) {
    return (
      <ResultCard
        dateKey={toDateKey()}
        result={progress.dailyToday}
        streak={progress.streak}
        heading="You've done today's challenge"
      />
    );
  }

  if (phase === 'intro') {
    const today = toDateKey();
    return (
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-10 text-center">
        <p className="text-sm font-semibold text-blue-600 mb-2">Daily #{getDailyNumber(today)}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          Today&apos;s challenge
        </h1>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Memorize {DAILY_WORD_COUNT} words, shown one at a time, then type them back in order.
          Everyone gets the same words today, and only your first try counts.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8 text-left">
          {[
            { value: DAILY_WORD_COUNT, label: 'words' },
            { value: `${DAILY_SECONDS_PER_WORD}s`, label: 'per word' },
            { value: '1', label: 'attempt' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-50 px-4 py-3 text-center">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-teal-50 border border-teal-200 px-5 py-4 text-sm text-teal-900 text-left mb-8">
          <span className="font-bold">Tip:</span> use the{' '}
          <Link href={`/tactics/${FIRST_TACTIC_ID}`} className="font-semibold underline">
            Linking Method
          </Link>
          . Picture each word crashing into the next in a strange little story.
        </div>

        <button
          onClick={start}
          className="inline-flex items-center justify-center min-h-[52px] w-full sm:w-auto px-10 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          I&apos;m ready
        </button>
      </div>
    );
  }

  if (phase === 'memorize') {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-10 text-center">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-500 mb-3">
          <span>Word {index + 1} of {words.length}</span>
          <span aria-live="polite" className="tabular-nums">{timeLeft}s</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-12">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>
        <div key={index} className="py-12 sm:py-16 animate-fade-up">
          <div className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 break-words">
            {words[index]}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-8">Link it to the previous word with a vivid image.</p>
      </div>
    );
  }

  if (phase === 'recall') {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-2">Type them back in order</h1>
        <p className="text-slate-500 text-center mb-8">
          {answers.length} of {words.length} entered
        </p>

        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {words.map((_, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm min-h-[44px] ${
                i === answers.length
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : i < answers.length
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-dashed border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-400">{i + 1}</span>
              <span className="font-semibold text-slate-800 truncate">
                {i < answers.length ? answers[i] || '—' : ''}
              </span>
            </li>
          ))}
        </ol>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) submitAnswer(input);
          }}
          className="flex gap-2"
        >
          <label htmlFor="daily-answer" className="sr-only">
            Word {answers.length + 1}
          </label>
          <input
            ref={inputRef}
            id="daily-answer"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Word ${answers.length + 1}`}
            className="flex-1 min-w-0 min-h-[52px] rounded-xl border-2 border-slate-200 px-4 text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="min-h-[52px] px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            Next
          </button>
        </form>
        <button
          type="button"
          onClick={() => submitAnswer('')}
          className="mt-3 w-full min-h-[44px] text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          I don&apos;t remember, skip this one
        </button>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <ResultCard dateKey={dateKey} result={result} streak={progress?.streak ?? 1} words={words} answers={answers} />
    );
  }

  return null;
}

interface ResultCardProps {
  dateKey: string;
  result: DailyResult;
  streak: number;
  heading?: string;
  words?: string[];
  answers?: string[];
}

function ResultCard({ dateKey, result, streak, heading, words, answers }: ResultCardProps) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const correct = result.marks.filter(Boolean).length;
  const total = result.marks.length;
  const message =
    correct === total ? 'Perfect recall!' : correct >= total * 0.75 ? 'Great memory!' : correct >= total / 2 ? 'Solid effort!' : 'Tomorrow is a new chance!';

  const share = async () => {
    const text = getShareText(dateKey, result.marks, `${window.location.origin}/daily`);
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareState('copied');
    } catch (err) {
      // Closing the native share sheet rejects with AbortError; that isn't a failure
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setShareState('failed');
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-10 text-center animate-fade-up">
      <p className="text-sm font-semibold text-blue-600 mb-2">Daily #{getDailyNumber(dateKey)}</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
        {heading ?? message}
      </h1>

      <div className="flex justify-center gap-1.5 mb-6" aria-label={`${correct} of ${total} words correct`}>
        {result.marks.map((mark, i) => (
          <span
            key={i}
            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${mark ? 'bg-emerald-500' : 'bg-red-400'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{correct}/{total}</div>
          <div className="text-xs text-slate-500">words</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{result.score}</div>
          <div className="text-xs text-slate-500">score</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">🔥 {streak}</div>
          <div className="text-xs text-slate-500">day streak</div>
        </div>
      </div>

      {words && answers && (
        <details className="mb-8 text-left rounded-xl border border-slate-200">
          <summary className="cursor-pointer select-none px-5 py-3 min-h-[44px] font-semibold text-slate-700">
            See today&apos;s words
          </summary>
          <ol className="px-5 pb-4 space-y-2">
            {words.map((word, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                <span className="font-semibold text-slate-900">{word}</span>
                {!result.marks[i] && (
                  <span className="text-red-600">you wrote: {answers[i] || '(skipped)'}</span>
                )}
                <span className="ml-auto" aria-label={result.marks[i] ? 'correct' : 'incorrect'}>
                  {result.marks[i] ? '✅' : '❌'}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={share}
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
        >
          {shareState === 'copied' ? '✓ Copied to clipboard' : 'Share result'}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-xl bg-white border border-slate-300 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
        >
          Practice a technique
        </Link>
      </div>
      {shareState === 'failed' && (
        <p role="alert" className="mt-3 text-sm text-red-600">Couldn&apos;t share. Try taking a screenshot instead.</p>
      )}
      <p className="mt-6 text-sm text-slate-500">A new challenge unlocks at midnight.</p>
    </div>
  );
}
