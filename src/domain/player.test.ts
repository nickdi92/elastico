import { describe, expect, it } from 'vitest';
import { addTime, back, cues, currentRep, pause, remaining, resume, skip, start, tick } from './player';
import type { Step } from './types';

const step = (over: Partial<Step>): Step => ({
  kind: 'work',
  exerciseId: 'x',
  name: 'x',
  durationSec: 10,
  met: 4,
  exerciseNo: 1,
  exerciseCount: 1,
  ...over,
});

const steps: Step[] = [step({ durationSec: 10 }), step({ kind: 'rest', durationSec: 5 }), step({ durationSec: 8 })];
const T0 = 1_000_000;

describe('player', () => {
  it('counts down the current step', () => {
    const s = start(T0);
    expect(remaining(s, steps, T0 + 3000)).toBe(7);
  });

  it('moves to the next step and carries over late ticks', () => {
    const s = tick(start(T0), steps, T0 + 12_000);
    expect(s.index).toBe(1);
    expect(remaining(s, steps, T0 + 12_000)).toBe(3);
  });

  it('finishes after the last step', () => {
    const s = tick(start(T0), steps, T0 + 30_000);
    expect(s.done).toBe(true);
  });

  it('freezes time while paused', () => {
    const p = pause(start(T0), T0 + 2000);
    expect(remaining(p, steps, T0 + 9000)).toBe(8);
    expect(tick(p, steps, T0 + 60_000).index).toBe(0);
    const r = resume(p, T0 + 9000);
    expect(remaining(r, steps, T0 + 10_000)).toBe(7);
  });

  it('skips to the next step', () => {
    const s = skip(start(T0), steps, T0 + 1000);
    expect(s.index).toBe(1);
    expect(remaining(s, steps, T0 + 1000)).toBe(5);
  });

  it('goes back to the previous step only near the start of a step', () => {
    const s = skip(start(T0), steps, T0 + 1000);
    expect(back(s, T0 + 2000).index).toBe(0);
    const restarted = back(s, T0 + 5000);
    expect(restarted.index).toBe(1);
    expect(remaining(restarted, steps, T0 + 5000)).toBe(5);
  });

  it('adds extra seconds to the current step', () => {
    const s = addTime(start(T0), 15);
    expect(remaining(s, steps, T0)).toBe(25);
    expect(skip(s, steps, T0).extra).toBe(0);
  });

  it('works out the current rep', () => {
    const w = step({ reps: 10, repSec: 3, durationSec: 30 });
    expect(currentRep(w, 0)).toBe(1);
    expect(currentRep(w, 7)).toBe(3);
    expect(currentRep(w, 29.9)).toBe(10);
    const sides = step({ reps: 8, repSec: 3, sides: 2, durationSec: 48 });
    expect(currentRep(sides, 25)).toBe(1);
  });
});

describe('cues', () => {
  it('signals a phase change', () => {
    expect(cues(steps, { index: 0, elapsed: 9.9 }, { index: 1, elapsed: 0.1 })).toContain('phase');
  });

  it('counts down the last three seconds', () => {
    expect(cues(steps, { index: 1, elapsed: 1.9 }, { index: 1, elapsed: 2.1 })).toContain('count');
    expect(cues(steps, { index: 1, elapsed: 0.5 }, { index: 1, elapsed: 0.9 })).not.toContain('count');
  });

  it('ticks on every new rep', () => {
    const s = [step({ reps: 10, repSec: 3, durationSec: 30 })];
    expect(cues(s, { index: 0, elapsed: 2.9 }, { index: 0, elapsed: 3.1 })).toContain('rep');
    expect(cues(s, { index: 0, elapsed: 3.1 }, { index: 0, elapsed: 3.4 })).not.toContain('rep');
  });

  it('asks to switch side halfway through unilateral steps', () => {
    const s = [step({ reps: 8, repSec: 3, sides: 2, durationSec: 48 })];
    expect(cues(s, { index: 0, elapsed: 23.9 }, { index: 0, elapsed: 24.1 })).toContain('side');
  });
});
