import { describe, expect, it } from 'vitest';
import { buildTimeline, totalDuration } from './timeline';
import type { SessionTemplate } from './types';

const session: SessionTemplate = {
  id: 'A',
  letter: 'A',
  title: 'Test',
  warmup: ['mob-marcia', 'mob-braccia'],
  main: [
    { exerciseId: 'squat-elastico', sets: 2, reps: 10, repRange: [10, 15], restSec: 60, bandId: 'b-viola' },
    { exerciseId: 'affondo-indietro', sets: 2, reps: 8, repRange: [8, 12], restSec: 45 },
    { exerciseId: 'plank', sets: 1, seconds: 30, restSec: 30 },
  ],
  cooldown: ['st-femorali', 'st-respiro'],
};

describe('buildTimeline', () => {
  const steps = buildTimeline(session);

  it('starts with the warm-up', () => {
    expect(steps.slice(0, 2).map((s) => s.kind)).toEqual(['warmup', 'warmup']);
    expect(steps[0].durationSec).toBe(40);
  });

  it('adds a short get-ready rest pointing at the first exercise', () => {
    expect(steps[2].kind).toBe('rest');
    expect(steps[2].durationSec).toBe(15);
    expect(steps[2].next?.exerciseId).toBe('squat-elastico');
  });

  it('creates one work step per set', () => {
    expect(steps.filter((s) => s.kind === 'work')).toHaveLength(5);
  });

  it('times rep sets as reps × seconds per rep × sides', () => {
    const squat = steps.find((s) => s.exerciseId === 'squat-elastico' && s.kind === 'work')!;
    expect(squat.durationSec).toBe(30);
    expect(squat.bandId).toBe('b-viola');
    const lunge = steps.find((s) => s.exerciseId === 'affondo-indietro' && s.kind === 'work')!;
    expect(lunge.sides).toBe(2);
    expect(lunge.durationSec).toBe(48);
  });

  it('rests between sets and adds set-up time before a new exercise', () => {
    const i = steps.findIndex((s) => s.kind === 'work');
    expect(steps[i + 1]).toMatchObject({ kind: 'rest', durationSec: 60 });
    expect(steps[i + 1].next?.exerciseId).toBe('squat-elastico');
    expect(steps[i + 3]).toMatchObject({ kind: 'rest', durationSec: 75 });
    expect(steps[i + 3].next?.exerciseId).toBe('affondo-indietro');
  });

  it('goes straight to the cool-down after the last set', () => {
    const lastWork = steps.map((s) => s.kind).lastIndexOf('work');
    expect(steps[lastWork + 1].kind).toBe('cooldown');
  });

  it('numbers main exercises', () => {
    const plank = steps.find((s) => s.exerciseId === 'plank' && s.kind === 'work')!;
    expect(plank).toMatchObject({ exerciseNo: 3, exerciseCount: 3, set: 1, totalSets: 1, durationSec: 30 });
  });

  it('holds unilateral stretches 30 seconds per side', () => {
    const stretch = steps.find((s) => s.exerciseId === 'st-femorali')!;
    expect(stretch).toMatchObject({ kind: 'cooldown', sides: 2, durationSec: 60 });
  });

  it('sums durations', () => {
    expect(totalDuration([{ durationSec: 10 }, { durationSec: 5 }] as never)).toBe(15);
  });
});
