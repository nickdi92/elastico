import type { Plan, WorkoutRecord } from './types';

const SPREAD: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 2, 4, 5],
  5: [0, 1, 3, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function suggestDays(sessionsPerWeek: number): number[] {
  return SPREAD[sessionsPerWeek] ?? SPREAD[3];
}

/** 0 = lunedì … 6 = domenica */
export function weekday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - weekday(d));
  return d;
}

export function weekCount(history: WorkoutRecord[], now: Date): number {
  const from = startOfWeek(now).getTime();
  return history.filter((r) => {
    const t = new Date(r.startedAt).getTime();
    return t >= from && t <= now.getTime();
  }).length;
}

export function nextSessionIndex(plan: Plan, history: WorkoutRecord[]): number {
  const since = new Date(plan.createdAt).getTime();
  const done = history.filter((r) => new Date(r.startedAt).getTime() >= since).length;
  return done % plan.sessions.length;
}
