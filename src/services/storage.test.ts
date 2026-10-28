import { describe, expect, it } from 'vitest';
import type { ActiveWorkout } from '../domain/activeWorkout';
import { elapsed } from '../domain/player';
import { DEFAULT_STATE, parseActive, parseState } from './storage';

describe('parseState', () => {
  it('returns defaults when nothing is stored', () => {
    expect(parseState(null)).toEqual(DEFAULT_STATE);
  });

  it('returns defaults when the stored value is corrupt', () => {
    expect(parseState('{nope')).toEqual(DEFAULT_STATE);
  });

  it('keeps stored data and fills in missing settings', () => {
    const stored = { version: 1, history: [{ id: 'x' }], settings: { voice: false } };
    const s = parseState(JSON.stringify(stored));
    expect(s.history).toEqual([{ id: 'x' }]);
    expect(s.settings).toEqual({ ...DEFAULT_STATE.settings, voice: false });
  });

  it('ignores data saved by an unknown version', () => {
    expect(parseState(JSON.stringify({ version: 99, history: [{ id: 'x' }] }))).toEqual(DEFAULT_STATE);
  });
});

describe('parseActive', () => {
  const active: ActiveWorkout = {
    session: { id: 'A', letter: 'A', title: 'Gambe', warmup: [], main: [], cooldown: [] },
    startedAt: '2026-10-28T10:00:00.000Z',
    player: { index: 3, stepStart: 100_000, pausedAt: null, extra: 0, done: false },
    totals: { kcal: 40, activeSec: 300, hrSec: 0, sampleClock: 0, samples: [], workDone: [2] },
    savedAt: 130_000,
  };

  it('returns nothing when nothing is stored or the value is corrupt', () => {
    expect(parseActive(null)).toBeNull();
    expect(parseActive('{nope')).toBeNull();
    expect(parseActive(JSON.stringify({ savedAt: 1 }))).toBeNull();
  });

  it('restores a running workout paused where it was last saved', () => {
    const out = parseActive(JSON.stringify(active))!;
    expect(out.player.pausedAt).toBe(130_000);
    expect(elapsed(out.player, 999_999)).toBe(30);
    expect(out.totals).toEqual(active.totals);
  });

  it('keeps a paused workout as it was', () => {
    const paused = { ...active, player: { ...active.player, pausedAt: 110_000 } };
    expect(parseActive(JSON.stringify(paused))).toEqual(paused);
  });
});
