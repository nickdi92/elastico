import { getExercise } from './exercises';
import { compatibleWeights, stepLoad } from './loads';
import type { Equipment, Feedback, Plan, Prescription, WorkoutRecord } from './types';

const MIN_HOLD_SEC = 10;

function adjust(p: Prescription, feedback: Feedback, equipment: Equipment): Prescription {
  if (p.seconds !== undefined) {
    const delta = feedback === 'facile' ? 5 : feedback === 'dura' ? -5 : 0;
    return { ...p, seconds: Math.max(MIN_HOLD_SEC, p.seconds + delta) };
  }
  if (p.reps === undefined || !p.repRange) return p;
  const [lo, hi] = p.repRange;

  if (feedback === 'facile') {
    if (p.reps >= hi) {
      const heavier = stepLoad(p, equipment, 1);
      if (heavier) return { ...p, ...heavier, reps: lo };
    }
    return { ...p, reps: Math.min(hi, p.reps + 2) };
  }
  if (feedback === 'giusta') return { ...p, reps: Math.min(hi, p.reps + 1) };

  if (p.reps <= lo) {
    const lighter = stepLoad(p, equipment, -1);
    if (lighter) return { ...p, ...lighter, reps: Math.min(hi, lo + 2) };
  }
  return { ...p, reps: Math.max(lo, p.reps - 2) };
}

/** Adatta la sessione appena fatta in base a com'è andata. */
export function applyFeedback(plan: Plan, sessionId: string, feedback: Feedback, equipment: Equipment): Plan {
  return {
    ...plan,
    sessions: plan.sessions.map((s) =>
      s.id === sessionId ? { ...s, main: s.main.map((p) => adjust(p, feedback, equipment)) } : s,
    ),
  };
}

/**
 * Quando il piano viene rigenerato, gli esercizi che restano ripartono da dove eri arrivato
 * (ripetizioni dentro il nuovo intervallo, elastico o peso solo se lo hai ancora).
 */
export function carryProgress(previous: Plan, next: Plan, equipment?: Equipment): Plan {
  const old = new Map(previous.sessions.flatMap((s) => s.main.map((p) => [p.exerciseId, p] as const)));
  const hasBand = (id?: string) => id !== undefined && (!equipment || equipment.bands.some((b) => b.id === id));
  const hasWeight = (exerciseId: string, id?: string) =>
    id !== undefined && (!equipment || compatibleWeights(getExercise(exerciseId), equipment.weights).some((w) => w.id === id));
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
    if (p.weightId && hasWeight(p.exerciseId, o.weightId)) out.weightId = o.weightId;
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
