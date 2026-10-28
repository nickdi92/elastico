import { describe, expect, it } from 'vitest';
import { nextSessionIndex, suggestDays, weekCount } from './schedule';
import type { Plan, WorkoutRecord } from './types';

const rec = (startedAt: string): WorkoutRecord => ({
  id: startedAt,
  sessionId: 'A',
  title: 'A',
  startedAt,
  durationSec: 1800,
  kcal: 200,
  kcalSource: 'stima',
  setsDone: 10,
  setsTotal: 10,
});

describe('suggestDays', () => {
  it('spreads sessions across the week starting on Monday', () => {
    expect(suggestDays(2)).toEqual([0, 3]);
    expect(suggestDays(3)).toEqual([0, 2, 4]);
    expect(suggestDays(4)).toEqual([0, 2, 4, 5]);
    expect(suggestDays(6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('weekCount', () => {
  it('counts workouts from Monday of the current week', () => {
    // mercoledì 28 ottobre 2026
    const now = new Date(2026, 9, 28, 10);
    const history = [
      rec(new Date(2026, 9, 25, 18).toISOString()), // domenica prima
      rec(new Date(2026, 9, 26, 8).toISOString()), // lunedì
      rec(new Date(2026, 9, 27, 19).toISOString()), // martedì
    ];
    expect(weekCount(history, now)).toBe(2);
  });
});

describe('nextSessionIndex', () => {
  it('rotates through sessions counting only workouts of the current plan', () => {
    const plan = { createdAt: '2026-10-20T00:00:00.000Z', sessions: [{}, {}] } as Plan;
    const history = [
      rec('2026-10-10T10:00:00.000Z'),
      rec('2026-10-21T10:00:00.000Z'),
      rec('2026-10-23T10:00:00.000Z'),
      rec('2026-10-25T10:00:00.000Z'),
    ];
    expect(nextSessionIndex(plan, history)).toBe(1);
    expect(nextSessionIndex(plan, [])).toBe(0);
  });
});
