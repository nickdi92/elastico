import { describe, expect, it } from 'vitest';
import { COLORS, THEMES, stepTheme, textOn } from './colors';
import { equipment } from './__fixtures__';
import type { Step } from './types';

const work = (over: Partial<Step>): Step => ({
  kind: 'work',
  exerciseId: 'squat-corpo',
  name: 'Squat',
  durationSec: 30,
  met: 5,
  exerciseNo: 1,
  exerciseCount: 5,
  ...over,
});

describe('textOn', () => {
  it('uses dark text on yellow', () => {
    expect(textOn(COLORS.giallo.hex)).toBe('#1C1C1E');
  });

  it('uses white text on purple and red', () => {
    expect(textOn(COLORS.viola.hex)).toBe('#FFFFFF');
    expect(textOn(COLORS.rosso.hex)).toBe('#FFFFFF');
  });
});

describe('stepTheme', () => {
  it('paints band exercises with the band colour', () => {
    const t = stepTheme(work({ exerciseId: 'squat-elastico', bandId: 'b-viola' }), equipment);
    expect(t.mid).toBe(COLORS.viola.hex);
    expect(t.text).toBe('#FFFFFF');
  });

  it('paints platform exercises with the colour of their zone', () => {
    const t = stepTheme(work({ exerciseId: 'pushup-piatt-petto' }), equipment);
    expect(t.mid).toBe(COLORS.rosso.hex);
  });

  it('uses ink for bodyweight work', () => {
    expect(stepTheme(work({ exerciseId: 'plank' }), equipment)).toEqual(THEMES.ink);
  });

  it('uses night for rests and dawn for warm-up and cool-down', () => {
    expect(stepTheme(work({ kind: 'rest' }), equipment)).toEqual(THEMES.night);
    expect(stepTheme(work({ kind: 'warmup' }), equipment)).toEqual(THEMES.dawn);
    expect(stepTheme(work({ kind: 'cooldown' }), equipment)).toEqual(THEMES.dawn);
  });
});
