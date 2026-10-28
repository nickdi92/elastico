import type { Step } from './types';

export interface PlayerState {
  index: number;
  /** ms epoch in cui è iniziato il passo corrente (spostato in avanti dalle pause). */
  stepStart: number;
  pausedAt: number | null;
  /** Secondi aggiunti al passo corrente (es. +15 al riposo). */
  extra: number;
  done: boolean;
}

/** Entro questi secondi "indietro" torna al passo precedente invece di ricominciare quello attuale. */
const BACK_THRESHOLD_SEC = 3;

export function start(now: number): PlayerState {
  return { index: 0, stepStart: now, pausedAt: null, extra: 0, done: false };
}

export function elapsed(s: PlayerState, now: number): number {
  return ((s.pausedAt ?? now) - s.stepStart) / 1000;
}

export function remaining(s: PlayerState, steps: Step[], now: number): number {
  const step = steps[s.index];
  if (!step) return 0;
  return step.durationSec + s.extra - elapsed(s, now);
}

export function tick(s: PlayerState, steps: Step[], now: number): PlayerState {
  if (s.pausedAt !== null || s.done) return s;
  let state = s;
  let left = remaining(state, steps, now);
  while (left <= 0) {
    const index = state.index + 1;
    if (index >= steps.length) return { ...state, index: steps.length - 1, done: true };
    state = { ...state, index, stepStart: now + left * 1000, extra: 0 };
    left = remaining(state, steps, now);
  }
  return state;
}

export function pause(s: PlayerState, now: number): PlayerState {
  return s.pausedAt === null ? { ...s, pausedAt: now } : s;
}

export function resume(s: PlayerState, now: number): PlayerState {
  if (s.pausedAt === null) return s;
  return { ...s, stepStart: s.stepStart + (now - s.pausedAt), pausedAt: null };
}

function goTo(s: PlayerState, index: number, now: number): PlayerState {
  return { ...s, index, stepStart: now, pausedAt: s.pausedAt === null ? null : now, extra: 0 };
}

export function skip(s: PlayerState, steps: Step[], now: number): PlayerState {
  if (s.index + 1 >= steps.length) return { ...s, done: true };
  return goTo(s, s.index + 1, now);
}

export function back(s: PlayerState, now: number): PlayerState {
  if (elapsed(s, now) > BACK_THRESHOLD_SEC || s.index === 0) return goTo(s, s.index, now);
  return goTo(s, s.index - 1, now);
}

export function addTime(s: PlayerState, seconds: number): PlayerState {
  return { ...s, extra: s.extra + seconds };
}

/** Ripetizione in corso (1-based), ricomincia da 1 al cambio lato. */
export function currentRep(step: Step, elapsedSec: number): number {
  if (!step.reps || !step.repSec) return 0;
  const perSide = step.reps * step.repSec;
  const t = Math.max(0, elapsedSec) % perSide;
  return Math.min(step.reps, Math.floor(t / step.repSec) + 1);
}

export type Cue = 'phase' | 'count' | 'rep' | 'side';

interface Moment {
  index: number;
  elapsed: number;
}

export function cues(steps: Step[], prev: Moment, curr: Moment): Cue[] {
  if (prev.index !== curr.index) return ['phase'];
  const step = steps[curr.index];
  if (!step) return [];
  const out: Cue[] = [];
  const before = step.durationSec - prev.elapsed;
  const after = step.durationSec - curr.elapsed;
  if ([3, 2, 1].some((k) => before > k && after <= k)) out.push('count');
  if (step.sides === 2) {
    const half = step.durationSec / 2;
    if (prev.elapsed < half && curr.elapsed >= half) out.push('side');
  }
  if (step.kind === 'work' && step.reps && currentRep(step, curr.elapsed) !== currentRep(step, prev.elapsed)) {
    out.push('rep');
  }
  return out;
}
