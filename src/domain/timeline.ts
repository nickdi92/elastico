import { getExercise } from './exercises';
import type { Prescription, SessionTemplate, Step } from './types';

export const WARMUP_SEC = 40;
export const SIDE_HOLD_SEC = 30;
export const GET_READY_SEC = 15;
/** Tempo in più per preparare il prossimo esercizio (cambiare elastico, spostare maniglie). */
export const SETUP_SEC = 15;

export function workSeconds(p: Prescription): number {
  const ex = getExercise(p.exerciseId);
  const sides = ex.unilateral ? 2 : 1;
  const perSide = p.seconds ?? (p.reps ?? 0) * ex.repSec;
  return perSide * sides;
}

export function describeDose(p: Prescription): string {
  const ex = getExercise(p.exerciseId);
  const each = ex.unilateral ? ' per lato' : '';
  const dose = p.seconds ? `${p.seconds} secondi` : `${p.reps} ripetizioni`;
  return `${p.sets} serie da ${dose}${each}`;
}

function nextInfo(p: Prescription): NonNullable<Step['next']> {
  const ex = getExercise(p.exerciseId);
  return { exerciseId: ex.id, name: ex.name, detail: describeDose(p), bandId: p.bandId, setup: ex.setup };
}

function easyStep(kind: 'warmup' | 'cooldown', id: string): Step {
  const ex = getExercise(id);
  const sides = ex.unilateral ? 2 : 1;
  return {
    kind,
    exerciseId: id,
    name: ex.name,
    durationSec: ex.unilateral ? SIDE_HOLD_SEC * 2 : WARMUP_SEC,
    met: ex.met,
    exerciseNo: 0,
    exerciseCount: 0,
    sides,
  };
}

export function buildTimeline(session: SessionTemplate): Step[] {
  const steps: Step[] = session.warmup.map((id) => easyStep('warmup', id));
  const count = session.main.length;

  if (count > 0) {
    steps.push({
      kind: 'rest',
      exerciseId: session.main[0].exerciseId,
      name: 'Preparati',
      durationSec: GET_READY_SEC,
      met: 2.5,
      exerciseNo: 1,
      exerciseCount: count,
      next: nextInfo(session.main[0]),
    });
  }

  session.main.forEach((p, i) => {
    const ex = getExercise(p.exerciseId);
    for (let set = 1; set <= p.sets; set++) {
      steps.push({
        kind: 'work',
        exerciseId: ex.id,
        name: ex.name,
        durationSec: workSeconds(p),
        met: ex.met,
        exerciseNo: i + 1,
        exerciseCount: count,
        set,
        totalSets: p.sets,
        reps: p.seconds ? undefined : p.reps,
        repSec: ex.repSec,
        sides: ex.unilateral ? 2 : 1,
        bandId: p.bandId,
      });
      const lastSet = set === p.sets;
      const lastExercise = i === count - 1;
      if (lastSet && lastExercise) continue;
      const following = lastSet ? session.main[i + 1] : p;
      steps.push({
        kind: 'rest',
        exerciseId: following.exerciseId,
        name: 'Riposo',
        durationSec: lastSet ? p.restSec + SETUP_SEC : p.restSec,
        met: 2.5,
        exerciseNo: lastSet ? i + 2 : i + 1,
        exerciseCount: count,
        set: lastSet ? 1 : set + 1,
        totalSets: following.sets,
        next: nextInfo(following),
      });
    }
  });

  steps.push(...session.cooldown.map((id) => easyStep('cooldown', id)));
  return steps;
}

export function totalDuration(steps: Pick<Step, 'durationSec'>[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec, 0);
}
