import { HighScore, GameSession, DailyResult } from '@/types';

const HIGH_SCORES_KEY = 'memory-game-high-scores';
const GAME_SESSIONS_KEY = 'memory-game-sessions';
const ATTEMPTS_KEY = 'memory-game-attempts';
const ACTIVITY_KEY = 'memory-game-activity';
const DAILY_KEY = 'memory-game-daily';

export const PROGRESS_KEYS = [HIGH_SCORES_KEY, ATTEMPTS_KEY, ACTIVITY_KEY, DAILY_KEY];

// Fired on same-tab writes so useProgress can refresh (the native
// `storage` event only fires in other tabs)
export const PROGRESS_EVENT = 'memory-game-progress';

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    // Storage full or blocked (private mode); progress just won't persist
  }
}

export function getHighScores(): HighScore[] {
  return readJSON<HighScore[]>(HIGH_SCORES_KEY, []);
}

export function saveHighScore(score: HighScore): void {
  if (typeof window === 'undefined') return;

  // Every completed game goes through here, so it doubles as the hook for
  // attempt counts and streaks
  const attempts = getAttempts();
  attempts[score.tacticId] = (attempts[score.tacticId] || 0) + 1;
  writeJSON(ATTEMPTS_KEY, attempts);
  recordActivity();

  const scores = getHighScores();
  scores.push(score);

  // Keep only top 100 scores
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 100);

  writeJSON(HIGH_SCORES_KEY, topScores);
}

export function getHighScoreForTactic(tacticId: string, difficulty?: string): HighScore | null {
  const scores = getHighScores();
  const filtered = scores.filter(s => {
    if (s.tacticId !== tacticId) return false;
    if (difficulty && s.difficulty !== difficulty) return false;
    return true;
  });

  return filtered.length > 0 ? filtered[0] : null;
}

export function getAttempts(): Record<string, number> {
  const stored = readJSON<Record<string, number> | null>(ATTEMPTS_KEY, null);
  if (stored) return stored;

  // Players from before attempt tracking: count what's in their high scores
  const derived: Record<string, number> = {};
  for (const s of getHighScores()) {
    derived[s.tacticId] = (derived[s.tacticId] || 0) + 1;
  }
  return derived;
}

export function saveGameSession(session: GameSession): void {
  if (typeof window === 'undefined') return;

  const sessions = getGameSessions();
  sessions.push(session);

  // Keep only last 50 sessions
  const recentSessions = sessions.slice(-50);

  writeJSON(GAME_SESSIONS_KEY, recentSessions);
}

export function getGameSessions(): GameSession[] {
  return readJSON<GameSession[]>(GAME_SESSIONS_KEY, []);
}

// Local calendar date as YYYY-MM-DD, so a "day" matches the player's clock
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getActivityDates(): string[] {
  const stored = readJSON<string[] | null>(ACTIVITY_KEY, null);
  if (stored) return stored;
  return [...new Set(getHighScores().map(s => toDateKey(new Date(s.timestamp))))].sort();
}

export function recordActivity(): void {
  const today = toDateKey();
  const dates = getActivityDates();
  if (dates.includes(today)) return;
  writeJSON(ACTIVITY_KEY, [...dates, today].slice(-400));
}

// Consecutive days played, ending today or yesterday (a streak survives
// until the end of the day after the last game)
export function getCurrentStreak(dates: string[], today: Date = new Date()): number {
  const played = new Set(dates);
  const cursor = new Date(today);
  if (!played.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (played.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getDailyResults(): Record<string, DailyResult> {
  return readJSON<Record<string, DailyResult>>(DAILY_KEY, {});
}

export function saveDailyResult(dateKey: string, result: DailyResult): void {
  const results = getDailyResults();
  if (results[dateKey]) return; // first attempt of the day is the one that counts
  results[dateKey] = result;
  writeJSON(DAILY_KEY, results);
  recordActivity();
}

export function calculateScore(
  correctCount: number,
  totalCount: number,
  timeElapsed: number,
  difficulty: string
): { score: number; accuracy: number } {
  const accuracy = (correctCount / totalCount) * 100;

  // Base points per correct answer
  const basePoints = correctCount * 10;

  // Difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'Beginner' ? 1 :
    difficulty === 'Intermediate' ? 1.5 : 2;

  // Time bonus (faster = more points, max 50% bonus)
  const timeBonus = Math.max(0, Math.floor((300 - timeElapsed) / 10));

  const finalScore = Math.floor(
    (basePoints + timeBonus) * difficultyMultiplier
  );

  return {
    score: finalScore,
    accuracy: Math.round(accuracy)
  };
}
