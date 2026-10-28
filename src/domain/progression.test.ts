import { describe, expect, it } from 'vitest';
import { applyFeedback, carryProgress, feedbackToApply } from './progression';
import { bands } from './__fixtures__';
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
    const next = applyFeedback(plan(), 'A', 'facile', bands);
    expect(next.sessions[0].main[0].reps).toBe(14);
  });

  it('moves to a stronger band when reps are already at the top', () => {
    const next = applyFeedback(plan(), 'A', 'facile', bands);
    const ponte = next.sessions[0].main[2];
    expect(ponte.reps).toBe(15); // senza elastico resta al massimo
    const p = plan();
    p.sessions[0].main[0].reps = 15;
    const up = applyFeedback(p, 'A', 'facile', bands).sessions[0].main[0];
    expect(up.bandId).toBe('b-viola');
    expect(up.reps).toBe(10);
  });

  it('adds one rep when the session felt right', () => {
    expect(applyFeedback(plan(), 'A', 'giusta', bands).sessions[0].main[0].reps).toBe(13);
  });

  it('removes two reps when the session was too hard', () => {
    expect(applyFeedback(plan(), 'A', 'dura', bands).sessions[0].main[0].reps).toBe(10);
  });

  it('moves to a lighter band when reps are already at the bottom', () => {
    const p = plan();
    p.sessions[0].main[0].reps = 10;
    const down = applyFeedback(p, 'A', 'dura', bands).sessions[0].main[0];
    expect(down.bandId).toBe('b-giallo');
    expect(down.reps).toBe(12);
  });

  it('changes holds by five seconds, never below ten', () => {
    expect(applyFeedback(plan(), 'A', 'facile', bands).sessions[0].main[1].seconds).toBe(35);
    expect(applyFeedback(plan(), 'A', 'dura', bands).sessions[0].main[1].seconds).toBe(25);
    const p = plan();
    p.sessions[0].main[1].seconds = 12;
    expect(applyFeedback(p, 'A', 'dura', bands).sessions[0].main[1].seconds).toBe(10);
  });

  it('only touches the session that was rated', () => {
    const next = applyFeedback(plan(), 'A', 'facile', bands);
    expect(next.sessions[1].main[0].reps).toBe(12);
  });

  it('does not mutate the original plan', () => {
    const p = plan();
    applyFeedback(p, 'A', 'facile', bands);
    expect(p.sessions[0].main[0].reps).toBe(12);
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
