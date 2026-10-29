import { describe, expect, it } from 'vitest';
import { applyFeedback, carryProgress, feedbackToApply } from './progression';
import { equipment, weights } from './__fixtures__';
import type { Plan } from './types';

const plan = (): Plan => ({
  createdAt: '2026-10-20T00:00:00.000Z',
  weeks: 6,
  splitName: 'test',
  sessions: [
    {
      id: 'A',
      letter: 'A',
      title: 'A',
      warmup: [],
      cooldown: [],
      main: [
        { exerciseId: 'squat-elastico', sets: 3, reps: 12, repRange: [10, 15], restSec: 60, bandId: 'b-rosso' },
        { exerciseId: 'plank', sets: 3, seconds: 30, restSec: 30 },
        { exerciseId: 'ponte-glutei', sets: 3, reps: 15, repRange: [10, 15], restSec: 60 },
      ],
    },
    {
      id: 'B',
      letter: 'B',
      title: 'B',
      warmup: [],
      cooldown: [],
      main: [{ exerciseId: 'curl-elastico', sets: 3, reps: 12, repRange: [10, 15], restSec: 60, bandId: 'b-giallo' }],
    },
  ],
});

describe('applyFeedback', () => {
  it('adds two reps when the session was too easy', () => {
    const next = applyFeedback(plan(), 'A', 'facile', equipment);
    expect(next.sessions[0].main[0].reps).toBe(14);
  });

  it('moves to a stronger band when reps are already at the top', () => {
    const next = applyFeedback(plan(), 'A', 'facile', equipment);
    const ponte = next.sessions[0].main[2];
    expect(ponte.reps).toBe(15); // senza elastico resta al massimo
    const p = plan();
    p.sessions[0].main[0].reps = 15;
    const up = applyFeedback(p, 'A', 'facile', equipment).sessions[0].main[0];
    expect(up.bandId).toBe('b-viola');
    expect(up.reps).toBe(10);
  });

  it('adds one rep when the session felt right', () => {
    expect(applyFeedback(plan(), 'A', 'giusta', equipment).sessions[0].main[0].reps).toBe(13);
  });

  it('removes two reps when the session was too hard', () => {
    expect(applyFeedback(plan(), 'A', 'dura', equipment).sessions[0].main[0].reps).toBe(10);
  });

  it('moves to a lighter band when reps are already at the bottom', () => {
    const p = plan();
    p.sessions[0].main[0].reps = 10;
    const down = applyFeedback(p, 'A', 'dura', equipment).sessions[0].main[0];
    expect(down.bandId).toBe('b-giallo');
    expect(down.reps).toBe(12);
  });

  it('changes holds by five seconds, never below ten', () => {
    expect(applyFeedback(plan(), 'A', 'facile', equipment).sessions[0].main[1].seconds).toBe(35);
    expect(applyFeedback(plan(), 'A', 'dura', equipment).sessions[0].main[1].seconds).toBe(25);
    const p = plan();
    p.sessions[0].main[1].seconds = 12;
    expect(applyFeedback(p, 'A', 'dura', equipment).sessions[0].main[1].seconds).toBe(10);
  });

  it('only touches the session that was rated', () => {
    const next = applyFeedback(plan(), 'A', 'facile', equipment);
    expect(next.sessions[1].main[0].reps).toBe(12);
  });

  it('does not mutate the original plan', () => {
    const p = plan();
    applyFeedback(p, 'A', 'facile', equipment);
    expect(p.sessions[0].main[0].reps).toBe(12);
  });
});

describe('applyFeedback with weights', () => {
  const gear = { ...equipment, weights };
  const withWeight = (exerciseId: string, weightId: string, reps: number): Plan => ({
    ...plan(),
    sessions: [{ id: 'A', letter: 'A', title: 'A', warmup: [], cooldown: [], main: [{ exerciseId, sets: 3, reps, repRange: [10, 15], restSec: 60, weightId }] }],
  });

  it('moves to the next heavier weight held the same way', () => {
    const up = applyFeedback(withWeight('curl-manubri', 'w-manubri-4', 15), 'A', 'facile', gear).sessions[0].main[0];
    expect(up).toMatchObject({ weightId: 'w-manubri-10', reps: 10 });
  });

  it('never switches to a weight the exercise cannot use', () => {
    const top = applyFeedback(withWeight('curl-manubri', 'w-manubri-10', 15), 'A', 'facile', gear).sessions[0].main[0];
    expect(top).toMatchObject({ weightId: 'w-manubri-10', reps: 15 });
  });

  it('can go from a backpack to a kettlebell for a goblet squat', () => {
    const up = applyFeedback(withWeight('squat-goblet', 'w-zaino', 15), 'A', 'facile', gear).sessions[0].main[0];
    expect(up.weightId).toBe('w-kettlebell');
  });

  it('moves to a lighter weight when it was too hard at the bottom of the range', () => {
    const down = applyFeedback(withWeight('curl-manubri', 'w-manubri-10', 10), 'A', 'dura', gear).sessions[0].main[0];
    expect(down).toMatchObject({ weightId: 'w-manubri-4', reps: 12 });
  });
});

describe('carryProgress', () => {
  it('keeps reps, holds and band of exercises that stay in the new plan', () => {
    const old = plan();
    old.sessions[0].main[0] = { ...old.sessions[0].main[0], reps: 14, bandId: 'b-viola' };
    old.sessions[0].main[1] = { ...old.sessions[0].main[1], seconds: 45 };
    const next = plan();
    next.sessions.reverse();
    const carried = carryProgress(old, next);
    const squat = carried.sessions[1].main[0];
    expect(squat).toMatchObject({ exerciseId: 'squat-elastico', reps: 14, bandId: 'b-viola' });
    expect(carried.sessions[1].main[1].seconds).toBe(45);
  });

  it('keeps the weight only if it is still in the bag', () => {
    const old = plan();
    old.sessions[1].main[0] = { exerciseId: 'curl-manubri', sets: 3, reps: 12, repRange: [10, 15], restSec: 60, weightId: 'w-manubri-10' };
    const next = plan();
    next.sessions[1].main[0] = { ...old.sessions[1].main[0], weightId: 'w-manubri-4' };
    expect(carryProgress(old, next, { ...equipment, weights }).sessions[1].main[0].weightId).toBe('w-manubri-10');
    const without = weights.filter((w) => w.id !== 'w-manubri-10');
    expect(carryProgress(old, next, { ...equipment, weights: without }).sessions[1].main[0].weightId).toBe('w-manubri-4');
  });

  it('leaves new exercises untouched', () => {
    const next = plan();
    next.sessions[1].main[0] = { exerciseId: 'face-pull', sets: 3, reps: 12, repRange: [10, 15], restSec: 60, bandId: 'b-giallo' };
    expect(carryProgress(plan(), next).sessions[1].main[0].reps).toBe(12);
  });
});

describe('feedbackToApply', () => {
  const rec = (setsDone: number, feedback: 'facile' | 'giusta' | 'dura') => ({ setsDone, setsTotal: 10, feedback });

  it('progresses only when most sets were done', () => {
    expect(feedbackToApply(rec(8, 'facile'))).toBe('facile');
    expect(feedbackToApply(rec(7, 'giusta'))).toBe('giusta');
    expect(feedbackToApply(rec(3, 'facile'))).toBeUndefined();
    expect(feedbackToApply(rec(0, 'giusta'))).toBeUndefined();
  });

  it('always eases off when it felt too hard', () => {
    expect(feedbackToApply(rec(2, 'dura'))).toBe('dura');
  });

  it('does nothing without an answer', () => {
    expect(feedbackToApply({ setsDone: 10, setsTotal: 10 })).toBeUndefined();
  });
});
