import { describe, it, expect } from 'vitest';
import { seededRng, shuffleArray } from '../utils/shuffle';

describe('seededRng', () => {
  it('produces the same sequence for the same seed', () => {
    const rng1 = seededRng(42);
    const rng2 = seededRng(42);
    for (let i = 0; i < 20; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = seededRng(1);
    const rng2 = seededRng(2);
    const vals1 = Array.from({ length: 10 }, () => rng1());
    const vals2 = Array.from({ length: 10 }, () => rng2());
    expect(vals1).not.toEqual(vals2);
  });

  it('returns values in [0, 1)', () => {
    const rng = seededRng(12345);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffleArray', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr, seededRng(99));
    expect(result).toHaveLength(arr.length);
  });

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffleArray(arr, seededRng(100));
    expect(result.sort()).toEqual([...arr].sort());
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffleArray(arr, seededRng(77));
    expect(arr).toEqual(copy);
  });

  it('produces a deterministic shuffle for the same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const r1 = shuffleArray(arr, seededRng(55));
    const r2 = shuffleArray(arr, seededRng(55));
    expect(r1).toEqual(r2);
  });
});
