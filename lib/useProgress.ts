'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { Progress, TacticProgress } from '@/types';
import {
  PROGRESS_EVENT,
  PROGRESS_KEYS,
  getAttempts,
  getActivityDates,
  getCurrentStreak,
  getDailyResults,
  getHighScores,
  toDateKey,
} from './storage';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(PROGRESS_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(PROGRESS_EVENT, onChange);
  };
}

// The raw stored strings make a stable snapshot: it only changes when the data does
function getSnapshot() {
  try {
    return PROGRESS_KEYS.map((key) => localStorage.getItem(key) ?? '').join('\u0000');
  } catch {
    return '';
  }
}

function getServerSnapshot() {
  return null;
}

/** Player progress from localStorage; null during server render and hydration. */
export function useProgress(): Progress | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    if (snapshot === null) return null;

    const attempts = getAttempts();
    const tactics: Record<string, TacticProgress> = {};
    for (const s of getHighScores()) {
      const current = tactics[s.tacticId];
      tactics[s.tacticId] = {
        bestScore: Math.max(current?.bestScore ?? 0, s.score),
        bestAccuracy: Math.max(current?.bestAccuracy ?? 0, s.accuracy),
        attempts: attempts[s.tacticId] ?? 0,
      };
    }

    const daily = getDailyResults();
    return {
      tactics,
      streak: getCurrentStreak(getActivityDates()),
      totalGames:
        Object.values(attempts).reduce((sum, n) => sum + n, 0) + Object.keys(daily).length,
      dailyToday: daily[toDateKey()] ?? null,
    };
  }, [snapshot]);
}
