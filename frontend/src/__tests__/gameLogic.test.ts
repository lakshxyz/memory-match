import { describe, it, expect } from 'vitest';
import { buildDeck, shouldUpgradeDifficulty, formatTime, TOTAL_CARDS, TOTAL_PAIRS } from '../utils/gameLogic';

describe('buildDeck', () => {
  it(`produces ${TOTAL_CARDS} cards`, () => {
    expect(buildDeck(1)).toHaveLength(TOTAL_CARDS);
  });

  it('has exactly 2 cards per pair', () => {
    const deck = buildDeck(1);
    const pairCounts: Record<number, number> = {};
    for (const card of deck) {
      pairCounts[card.pairId] = (pairCounts[card.pairId] ?? 0) + 1;
    }
    Object.values(pairCounts).forEach(count => {
      expect(count).toBe(2);
    });
  });

  it('assigns unique position ids 0–15', () => {
    const deck = buildDeck(1);
    const ids = deck.map(c => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: TOTAL_CARDS }, (_, i) => i));
  });

  it('all cards start face-down and unmatched', () => {
    const deck = buildDeck(1);
    deck.forEach(card => {
      expect(card.isFlipped).toBe(false);
      expect(card.isMatched).toBe(false);
    });
  });

  it('produces different orderings for different seeds', () => {
    const deck1 = buildDeck(1).map(c => c.pairId);
    const deck2 = buildDeck(999999).map(c => c.pairId);
    expect(deck1).not.toEqual(deck2);
  });

  it('produces the same ordering for the same seed', () => {
    const deck1 = buildDeck(42).map(c => c.pairId);
    const deck2 = buildDeck(42).map(c => c.pairId);
    expect(deck1).toEqual(deck2);
  });
});

describe('shouldUpgradeDifficulty', () => {
  it('returns false if already hard', () => {
    expect(shouldUpgradeDifficulty(6, 10, 20, 'hard')).toBe(false);
  });

  it('returns false when fewer than 4 pairs matched', () => {
    expect(shouldUpgradeDifficulty(3, 6, 10, 'easy')).toBe(false);
  });

  it('upgrades when movesPerPair ≤ 2.5 after 4+ matches', () => {
    // 4 pairs, 10 moves → 2.5 moves/pair — edge case: should upgrade
    expect(shouldUpgradeDifficulty(4, 10, 120, 'easy')).toBe(true);
  });

  it('upgrades when elapsed < 30s after 4+ matches', () => {
    // High moves but very fast
    expect(shouldUpgradeDifficulty(4, 50, 20, 'easy')).toBe(true);
  });

  it('does NOT upgrade when moves are high and time is slow', () => {
    // 4 pairs, 20 moves → 5 moves/pair, 90 seconds — too slow and too many mistakes
    expect(shouldUpgradeDifficulty(4, 20, 90, 'easy')).toBe(false);
  });
});

describe('formatTime', () => {
  it('formats 0 as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 65 seconds as 01:05', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('formats 3600 as 60:00', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('zero-pads seconds', () => {
    expect(formatTime(9)).toBe('00:09');
  });
});

describe('TOTAL_PAIRS and TOTAL_CARDS', () => {
  it('TOTAL_CARDS is 2 * TOTAL_PAIRS', () => {
    expect(TOTAL_CARDS).toBe(TOTAL_PAIRS * 2);
  });
});
