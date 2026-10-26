import { WORD_LISTS } from './gameLogic';

export const DAILY_WORD_COUNT = 8;
export const DAILY_SECONDS_PER_WORD = 3;

// Day #1 of the daily challenge
const LAUNCH_DATE = '2026-10-26';

// mulberry32: tiny seeded PRNG so every player gets the same words on the same day
function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function getDailyWords(dateKey: string): string[] {
  const random = seededRandom(hashString(`daily-${dateKey}`));
  const pool = [...new Set([...WORD_LISTS.common, ...WORD_LISTS.objects])];
  const words: string[] = [];
  while (words.length < DAILY_WORD_COUNT) {
    const [word] = pool.splice(Math.floor(random() * pool.length), 1);
    words.push(word);
  }
  return words;
}

function parseDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function getDailyNumber(dateKey: string): number {
  const days = Math.round((parseDateKey(dateKey) - parseDateKey(LAUNCH_DATE)) / 86_400_000);
  return Math.max(1, days + 1);
}

export function getShareText(dateKey: string, marks: boolean[], url: string): string {
  const correct = marks.filter(Boolean).length;
  return [
    `Memory Champions Daily #${getDailyNumber(dateKey)}`,
    `${correct}/${marks.length} words 🧠`,
    marks.map((m) => (m ? '🟩' : '🟥')).join(''),
    url,
  ].join('\n');
}
