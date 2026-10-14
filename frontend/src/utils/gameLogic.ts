import { seededRng, shuffleArray } from './shuffle';
import type { Card, Difficulty } from '../types/game';

export const SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍒', '🍑'];

export const TOTAL_PAIRS = 8;
export const TOTAL_CARDS = TOTAL_PAIRS * 2;

export function buildDeck(seed: number): Card[] {
  const rng = seededRng(seed);

  const pairs: Omit<Card, 'id' | 'isFlipped' | 'isMatched'>[] = [];
  for (let pairId = 0; pairId < TOTAL_PAIRS; pairId++) {
    pairs.push({ symbol: SYMBOLS[pairId], pairId });
    pairs.push({ symbol: SYMBOLS[pairId], pairId });
  }

  const shuffled = shuffleArray(pairs, rng);

  return shuffled.map((p, index) => ({
    id: index,
    symbol: p.symbol,
    pairId: p.pairId,
    isFlipped: false,
    isMatched: false,
  }));
}

export const FLIP_BACK_DELAY: Record<Difficulty, number> = {
  easy: 1200,
  hard: 700,
};

export function shouldUpgradeDifficulty(
  matchedPairs: number,
  moves: number,
  elapsedSeconds: number,
  currentDifficulty: Difficulty
): boolean {
  if (currentDifficulty === 'hard') return false;
  if (matchedPairs < 4) return false;
  const movesPerPair = moves / matchedPairs;
  return movesPerPair <= 2.5 || elapsedSeconds < 30;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
