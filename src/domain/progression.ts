import type { Band, Feedback, Plan, Prescription, WorkoutRecord } from './types';

const MIN_HOLD_SEC = 10;

function bandStep(bands: Band[], bandId: string, dir: 1 | -1): string | undefined {
  const sorted = [...bands].sort((a, b) => a.kg - b.kg);
  const i = sorted.findIndex((b) => b.id === bandId);
  return sorted[i + dir]?.id;
}

function adjust(p: Prescription, feedback: Feedback, bands: Band[]): Prescription {
  if (p.seconds !== undefined) {
    const delta = feedback === 'facile' ? 5 : feedback === 'dura' ? -5 : 0;
    return { ...p, seconds: Math.max(MIN_HOLD_SEC, p.seconds + delta) };
  }
  if (p.reps === undefined || !p.repRange) return p;
  const [lo, hi] = p.repRange;

  if (feedback === 'facile') {
    if (p.reps >= hi && p.bandId) {
      const stronger = bandStep(bands, p.bandId, 1);
      if (stronger) return { ...p, bandId: stronger, reps: lo };
    }
    return { ...p, reps: Math.min(hi, p.reps + 2) };
  }
  if (feedback === 'giusta') return { ...p, reps: Math.min(hi, p.reps + 1) };

  if (p.reps <= lo && p.bandId) {
    const weaker = bandStep(bands, p.bandId, -1);
    if (weaker) return { ...p, bandId: weaker, reps: Math.min(hi, lo + 2) };
  }
  return { ...p, reps: Math.max(lo, p.reps - 2) };
}

/** Adatta la sessione appena fatta in base a com'è andata. */
export function applyFeedback(plan: Plan, sessionId: string, feedback: Feedback, bands: Band[]): Plan {
  return {
    ...plan,
    sessions: plan.sessions.map((s) =>
      s.id === sessionId ? { ...s, main: s.main.map((p) => adjust(p, feedback, bands)) } : s,
    ),
  };
}

/**
 * Quando il piano viene rigenerato, gli esercizi che restano ripartono da dove eri arrivato
 * (ripetizioni dentro il nuovo intervallo, elastico solo se lo hai ancora).
 */
export function carryProgress(previous: Plan, next: Plan, bands?: Band[]): Plan {
  const old = new Map(previous.sessions.flatMap((s) => s.main.map((p) => [p.exerciseId, p] as const)));
  const hasBand = (id?: string) => id !== undefined && (!bands || bands.some((b) => b.id === id));
  const carry = (p: Prescription): Prescription => {
    const o = old.get(p.exerciseId);
    if (!o) return p;
    const out = { ...p };
    if (p.seconds !== undefined && o.seconds !== undefined) out.seconds = o.seconds;
    if (p.reps !== undefined && o.reps !== undefined) {
      const [lo, hi] = p.repRange ?? [o.reps, o.reps];
      out.reps = Math.min(hi, Math.max(lo, o.reps));
    }
    if (p.bandId && hasBand(o.bandId)) out.bandId = o.bandId;
    return out;
  };
  return { ...next, sessions: next.sessions.map((s) => ({ ...s, main: s.main.map(carry) })) };
}

/** Quota minima di serie fatte perché "facile" o "giusta" facciano salire il piano. */
const MIN_COMPLETION = 0.7;

/** Si sale solo se l'allenamento è stato fatto davvero; "troppo dura" alleggerisce sempre. */
export function feedbackToApply(r: Pick<WorkoutRecord, 'setsDone' | 'setsTotal' | 'feedback'>): Feedback | undefined {
  if (r.feedback === 'dura') return 'dura';
  if (!r.feedback || r.setsTotal === 0 || r.setsDone / r.setsTotal < MIN_COMPLETION) return undefined;
  return r.feedback;
}
