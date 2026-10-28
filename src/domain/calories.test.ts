import { describe, expect, it } from 'vitest';
import { estimateKcal, hrKcalPerMin, hrMax, kcalPerSecond, metKcal } from './calories';
import { profile } from './__fixtures__';
import type { Step } from './types';

describe('metKcal', () => {
  it('is MET × kg × hours', () => {
    expect(metKcal(4, 76, 3600)).toBeCloseTo(304);
    expect(metKcal(4, 76, 1800)).toBeCloseTo(152);
  });
});

describe('hrKcalPerMin (Keytel 2005)', () => {
  it('uses the male equation', () => {
    expect(hrKcalPerMin(130, { sex: 'M', weightKg: 76, age: 38 })).toBeCloseTo(11.88, 1);
  });

  it('uses the female equation', () => {
    expect(hrKcalPerMin(130, { sex: 'F', weightKg: 60, age: 30 })).toBeCloseTo(7.74, 1);
  });

  it('averages both equations when sex is not given', () => {
    const m = hrKcalPerMin(130, { sex: 'M', weightKg: 70, age: 40 });
    const f = hrKcalPerMin(130, { sex: 'F', weightKg: 70, age: 40 });
    expect(hrKcalPerMin(130, { sex: 'X', weightKg: 70, age: 40 })).toBeCloseTo((m + f) / 2);
  });
});

describe('kcalPerSecond', () => {
  it('falls back to MET without heart rate', () => {
    expect(kcalPerSecond(5, undefined, profile)).toBeCloseTo((5 * 76) / 3600);
  });

  it('uses heart rate when it is in the reliable range', () => {
    expect(kcalPerSecond(5, 130, profile)).toBeCloseTo(hrKcalPerMin(130, profile) / 60);
  });

  it('ignores heart rate below 90 bpm', () => {
    expect(kcalPerSecond(2, 72, profile)).toBeCloseTo((2 * 76) / 3600);
  });
});

describe('estimateKcal', () => {
  it('sums MET energy over all steps', () => {
    const steps = [
      { met: 4, durationSec: 1800 },
      { met: 2, durationSec: 1800 },
    ] as Step[];
    expect(estimateKcal(steps, 76)).toBeCloseTo(152 + 76);
  });
});

describe('hrMax', () => {
  it('uses Tanaka', () => {
    expect(hrMax(40)).toBe(180);
  });
});
