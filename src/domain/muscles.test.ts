import { describe, expect, it } from 'vitest';
import { schedule } from './__fixtures__';
import { muscleOf, weeklySets } from './muscles';
import type { Plan } from './types';

const plan: Plan = {
  createdAt: '2026-10-29T00:00:00.000Z',
  weeks: 6,
  splitName: 'test',
  sessions: [
    { id: 'A', letter: 'A', title: 'A', warmup: [], cooldown: [], main: [{ exerciseId: 'curl-manubri', sets: 3, reps: 10, restSec: 60 }] },
    { id: 'B', letter: 'B', title: 'B', warmup: [], cooldown: [], main: [{ exerciseId: 'squat-corpo', sets: 2, reps: 12, restSec: 60 }] },
  ],
};

describe('muscles', () => {
  it('maps movements to the muscle they train', () => {
    expect(muscleOf('biceps')).toBe('bicipiti');
    expect(muscleOf('pullV')).toBe('dorso');
    expect(muscleOf('mobility')).toBeUndefined();
  });

  it('counts weekly sets following the rotation of sessions', () => {
    const sets = weeklySets(plan, { ...schedule, sessionsPerWeek: 3 });
    expect(sets.bicipiti).toBe(6); // A, B, A
    expect(sets.gambe).toBe(2);
  });

  it('counts squats for both thighs and glutes', () => {
    expect(weeklySets(plan, schedule).glutei).toBe(4);
  });
});
