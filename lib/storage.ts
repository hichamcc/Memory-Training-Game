import { HighScore, GameSession } from '@/types';

const HIGH_SCORES_KEY = 'memory-game-high-scores';
const GAME_SESSIONS_KEY = 'memory-game-sessions';

export function getHighScores(): HighScore[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(HIGH_SCORES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveHighScore(score: HighScore): void {
  if (typeof window === 'undefined') return;

  const scores = getHighScores();
  scores.push(score);

  // Keep only top 100 scores
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 100);

  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topScores));
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

export function saveGameSession(session: GameSession): void {
  if (typeof window === 'undefined') return;

  const sessions = getGameSessions();
  sessions.push(session);

  // Keep only last 50 sessions
  const recentSessions = sessions.slice(-50);

  localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(recentSessions));
}

export function getGameSessions(): GameSession[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(GAME_SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
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
