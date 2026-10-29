import { getExercise } from './exercises';
import type { Muscle, Pattern, Plan, Schedule } from './types';

export const MUSCLES: Muscle[] = ['petto', 'spalle', 'bicipiti', 'tricipiti', 'dorso', 'addominali', 'glutei', 'gambe'];

/** Si può insistere al massimo su questi muscoli: se insisti su tutto non insisti su niente. */
export const MAX_FOCUS = 4;

/** Serie dirette a settimana da cui un muscolo cresce davvero; sotto si mantiene. */
export const GROWTH_SETS = 10;

/** Muscolo allenato direttamente da ogni movimento. */
const PATTERN_MUSCLE: Partial<Record<Pattern, Muscle>> = {
  squat: 'gambe',
  lunge: 'gambe',
  calves: 'gambe',
  hinge: 'glutei',
  glutes: 'glutei',
  pushH: 'petto',
  pushV: 'spalle',
  raise: 'spalle',
  rearDelt: 'spalle',
  pullH: 'dorso',
  pullV: 'dorso',
  biceps: 'bicipiti',
  triceps: 'tricipiti',
  core: 'addominali',
};

/** Nel conto delle serie: squat, affondi e stacchi lavorano davvero sia le cosce sia i glutei. */
const ALSO_COUNTS: Partial<Record<Pattern, Muscle>> = {
  squat: 'glutei',
  lunge: 'glutei',
  hinge: 'gambe',
};

/** Movimenti con cui allenare ogni muscolo, dal più importante. */
export const MUSCLE_PATTERNS: Record<Muscle, Pattern[]> = {
  petto: ['pushH'],
  spalle: ['pushV', 'raise', 'rearDelt'],
  bicipiti: ['biceps'],
  tricipiti: ['triceps'],
  dorso: ['pullH', 'pullV'],
  addominali: ['core'],
  glutei: ['glutes', 'hinge'],
  gambe: ['squat', 'lunge'],
};

export function muscleOf(pattern: Pattern): Muscle | undefined {
  return PATTERN_MUSCLE[pattern];
}

/** Serie dirette a settimana per muscolo, seguendo la rotazione degli allenamenti. */
export function weeklySets(plan: Plan, schedule: Schedule): Record<Muscle, number> {
  const out = Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>;
  if (plan.sessions.length === 0) return out;
  for (let i = 0; i < schedule.sessionsPerWeek; i++) {
    for (const p of plan.sessions[i % plan.sessions.length].main) {
      const { pattern } = getExercise(p.exerciseId);
      for (const m of [muscleOf(pattern), ALSO_COUNTS[pattern]]) if (m) out[m] += p.sets;
    }
  }
  return out;
}
