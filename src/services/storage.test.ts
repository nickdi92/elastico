import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseState } from './storage';

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
