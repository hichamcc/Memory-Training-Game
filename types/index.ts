export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Tactic {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  difficulty: DifficultyLevel;
  bestFor: string;
  steps: string[];
  examples: string[];
  tips: string[];
  icon: string;
}

export interface GameConfig {
  itemCount: number;
  memorizeTime: number; // seconds per item
  recallTimeLimit: number; // total seconds for recall, 0 for unlimited
}

export interface GameSession {
  tacticId: string;
  difficulty: DifficultyLevel;
  itemsToMemorize: string[];
  userAnswers: string[];
  startTime: number;
  endTime?: number;
  score?: number;
  accuracy?: number;
}

export interface HighScore {
  id: string;
  tacticId: string;
  score: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  timestamp: number;
}

export type GamePhase = 'intro' | 'memorize' | 'recall' | 'results';
