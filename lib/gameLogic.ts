import { GameConfig } from '@/types';

export const GAME_CONFIGS: Record<string, Record<string, GameConfig>> = {
  'linking-method': {
    Beginner: { itemCount: 5, memorizeTime: 5, recallTimeLimit: 0 },
    Intermediate: { itemCount: 8, memorizeTime: 3, recallTimeLimit: 120 },
    Advanced: { itemCount: 12, memorizeTime: 2, recallTimeLimit: 90 }
  },
  'memory-palace': {
    Beginner: { itemCount: 5, memorizeTime: 6, recallTimeLimit: 0 },
    Intermediate: { itemCount: 8, memorizeTime: 4, recallTimeLimit: 150 },
    Advanced: { itemCount: 12, memorizeTime: 3, recallTimeLimit: 120 }
  },
  'peg-system': {
    Beginner: { itemCount: 5, memorizeTime: 5, recallTimeLimit: 0 },
    Intermediate: { itemCount: 8, memorizeTime: 3, recallTimeLimit: 120 },
    Advanced: { itemCount: 10, memorizeTime: 2, recallTimeLimit: 90 }
  },
  'chunking': {
    Beginner: { itemCount: 6, memorizeTime: 4, recallTimeLimit: 0 },
    Intermediate: { itemCount: 9, memorizeTime: 3, recallTimeLimit: 120 },
    Advanced: { itemCount: 12, memorizeTime: 2, recallTimeLimit: 90 }
  }
};

// Word lists for different games
export const WORD_LISTS = {
  common: [
    'apple', 'banana', 'car', 'dog', 'elephant', 'flower', 'guitar', 'house',
    'island', 'jacket', 'kite', 'lamp', 'mountain', 'notebook', 'ocean', 'piano',
    'queen', 'robot', 'star', 'tree', 'umbrella', 'violin', 'waterfall', 'xylophone',
    'yacht', 'zebra', 'airplane', 'bicycle', 'camera', 'dragon', 'engine', 'fire',
    'globe', 'hammer', 'iceberg', 'jungle', 'kettle', 'lion', 'mirror', 'nest'
  ],
  objects: [
    'book', 'phone', 'key', 'wallet', 'bottle', 'cup', 'plate', 'fork',
    'spoon', 'knife', 'chair', 'table', 'pen', 'pencil', 'paper', 'clock',
    'watch', 'glasses', 'hat', 'shoe', 'sock', 'shirt', 'pants', 'bag'
  ]
};

export function getRandomWords(count: number, category: keyof typeof WORD_LISTS = 'common'): string[] {
  const words = [...WORD_LISTS[category]];
  const selected: string[] = [];

  for (let i = 0; i < count && words.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selected.push(words[randomIndex]);
    words.splice(randomIndex, 1);
  }

  return selected;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim();
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
