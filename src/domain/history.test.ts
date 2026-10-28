import { describe, expect, it } from 'vitest';
import { applyDraft, draftOf, removeRecord, upsertRecord } from './history';
import type { WorkoutRecord } from './types';

const record = (id: string, startedAt: string, extra: Partial<WorkoutRecord> = {}): WorkoutRecord => ({
  id,
  sessionId: 'A',
  title: 'Gambe e tirata',
  startedAt,
  durationSec: 1834,
  kcal: 210,
  kcalSource: 'battito',
  setsDone: 10,
  setsTotal: 12,
  ...extra,
});

describe('applyDraft', () => {
  it('keeps the exact values when nothing changes', () => {
    const r = record('x', new Date(2026, 9, 20, 18, 30, 42).toISOString(), { feedback: 'giusta' });
    expect(applyDraft(r, draftOf(r))).toEqual(r);
  });

  it('writes the new date and time in local time', () => {
    const r = record('x', new Date(2026, 9, 20, 18, 30).toISOString());
    const out = applyDraft(r, { ...draftOf(r), date: '2026-10-22', time: '07:15' });
    expect(out.startedAt).toBe(new Date(2026, 9, 22, 7, 15).toISOString());
  });

  it('converts changed minutes to seconds', () => {
    const r = record('x', '2026-10-20T10:00:00.000Z');
    expect(applyDraft(r, { ...draftOf(r), minutes: 25 }).durationSec).toBe(1500);
  });

  it('marks calories typed by hand as an estimate', () => {
    const r = record('x', '2026-10-20T10:00:00.000Z');
    const out = applyDraft(r, { ...draftOf(r), kcal: 250 });
    expect(out.kcal).toBe(250);
    expect(out.kcalSource).toBe('stima');
  });

  it('can clear the feedback', () => {
    const r = record('x', '2026-10-20T10:00:00.000Z', { feedback: 'dura' });
    expect(applyDraft(r, { ...draftOf(r), feedback: undefined }).feedback).toBeUndefined();
  });
});

describe('upsertRecord', () => {
  const a = record('a', '2026-10-20T10:00:00.000Z');
  const b = record('b', '2026-10-22T10:00:00.000Z');

  it('adds a backdated workout in date order', () => {
    const c = record('c', '2026-10-21T10:00:00.000Z');
    expect(upsertRecord([a, b], c).map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('replaces the workout with the same id', () => {
    const out = upsertRecord([a, b], { ...a, kcal: 99 });
    expect(out).toHaveLength(2);
    expect(out[0].kcal).toBe(99);
  });

  it('moves an edited workout to its new date', () => {
    expect(upsertRecord([a, b], { ...a, startedAt: '2026-10-23T10:00:00.000Z' }).map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('removeRecord', () => {
  it('drops only the workout with that id', () => {
    const a = record('a', '2026-10-20T10:00:00.000Z');
    const b = record('b', '2026-10-22T10:00:00.000Z');
    expect(removeRecord([a, b], 'a')).toEqual([b]);
  });
});
