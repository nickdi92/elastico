import { EXERCISES } from './exercises';
import { buildTimeline, totalDuration } from './timeline';
import type {
  Band,
  BandLoad,
  Equipment,
  Exercise,
  Experience,
  Goal,
  Pattern,
  Plan,
  Prescription,
  Profile,
  Schedule,
  SessionTemplate,
} from './types';

interface Dose {
  reps: [number, number];
  rest: number;
}

const GOAL_DOSE: Record<Goal, Dose> = {
  forza: { reps: [6, 10], rest: 90 },
  tonificare: { reps: [10, 15], rest: 60 },
  dimagrire: { reps: [12, 20], rest: 30 },
  resistenza: { reps: [15, 20], rest: 30 },
  mobilita: { reps: [8, 12], rest: 45 },
};

interface Level {
  sets: number;
  restAdd: number;
  startAdd: number;
  hold: number;
  cardio: number;
  maxDiff: number;
  prefDiff: number;
  bandShift: number;
}

const LEVELS: Record<Experience, Level> = {
  principiante: { sets: 2, restAdd: 15, startAdd: 0, hold: 20, cardio: 30, maxDiff: 2, prefDiff: 1, bandShift: -1 },
  intermedio: { sets: 3, restAdd: 0, startAdd: 2, hold: 30, cardio: 40, maxDiff: 3, prefDiff: 2, bandShift: 0 },
  avanzato: { sets: 4, restAdd: -15, startAdd: 2, hold: 40, cardio: 45, maxDiff: 3, prefDiff: 3, bandShift: 1 },
};

interface Template {
  title: string;
  slots: Pattern[];
}

const FULL_A: Template = { title: 'Corpo intero', slots: ['squat', 'pushH', 'pullH', 'glutes', 'raise', 'core', 'biceps'] };
const FULL_B: Template = { title: 'Corpo intero', slots: ['lunge', 'pullV', 'pushH', 'hinge', 'rearDelt', 'core', 'triceps'] };
const FULL_C: Template = { title: 'Corpo intero', slots: ['hinge', 'pushH', 'pullH', 'squat', 'pushV', 'core', 'calves'] };
const LOWER_PULL: Template = {
  title: 'Gambe e tirata',
  slots: ['squat', 'pullH', 'hinge', 'pullV', 'lunge', 'biceps', 'core', 'calves'],
};
const PUSH_CORE: Template = {
  title: 'Spinta, spalle e core',
  slots: ['pushH', 'pushV', 'raise', 'core', 'triceps', 'pushH', 'rearDelt', 'core'],
};
const LEGS: Template = { title: 'Gambe', slots: ['squat', 'hinge', 'lunge', 'glutes', 'core', 'calves', 'core'] };
const PUSH: Template = { title: 'Spinta', slots: ['pushH', 'pushV', 'raise', 'triceps', 'pushH', 'core'] };
const PULL: Template = { title: 'Tirata', slots: ['pullH', 'pullV', 'rearDelt', 'biceps', 'pullH', 'core'] };

/** Slot riempiti solo se avanza tempo. */
const EXTRAS: Pattern[] = ['core', 'glutes', 'rearDelt', 'calves', 'cardio'];

const FALLBACK: Partial<Record<Pattern, Pattern[]>> = {
  squat: ['lunge', 'glutes'],
  lunge: ['squat', 'glutes'],
  hinge: ['glutes'],
  glutes: ['hinge'],
  pushV: ['raise', 'pushH'],
  raise: ['pushV'],
  pullH: ['rearDelt', 'pullV'],
  pullV: ['pullH', 'rearDelt'],
  rearDelt: ['pullH'],
  biceps: ['pullH'],
  triceps: ['pushH'],
};

const LETTERS = 'ABCDEFG';

function splitFor(sessionsPerWeek: number): { name: string; templates: Template[] } {
  if (sessionsPerWeek <= 2) return { name: 'Corpo intero A/B', templates: [FULL_A, FULL_B] };
  if (sessionsPerWeek === 3) return { name: 'Corpo intero A/B/C', templates: [FULL_A, FULL_B, FULL_C] };
  if (sessionsPerWeek === 4) return { name: 'Due sessioni alternate', templates: [LOWER_PULL, PUSH_CORE] };
  return { name: 'Gambe, spinta, tirata', templates: [LEGS, PUSH, PULL] };
}

function withCardio(slots: Pattern[], goal: Goal): Pattern[] {
  if (goal !== 'dimagrire' && goal !== 'resistenza') return slots;
  const out = [...slots];
  out.splice(2, 0, 'cardio');
  out.splice(6, 0, 'cardio');
  return out;
}

function isAvailable(ex: Exercise, profile: Profile, eq: Equipment): boolean {
  if (ex.avoid.some((l) => profile.limitations.includes(l))) return false;
  if (eq.place === 'dentro' && ex.space === 'large') return false;
  return ex.requires.every((r) => {
    if (r === 'band') return eq.bands.length > 0;
    if (r === 'platform') return eq.platform !== null;
    return eq.gear.includes(r);
  });
}

function chooseBand(load: BandLoad, bands: Band[], shift: number): string | undefined {
  const sorted = [...bands].sort((a, b) => a.kg - b.kg);
  const n = sorted.length;
  if (n === 0) return undefined;
  const base = load === 'light' ? 0 : load === 'medium' ? Math.floor((n - 1) / 2) : n - 1;
  const i = Math.min(n - 1, Math.max(0, base + shift));
  return sorted[i].id;
}

interface Ctx {
  profile: Profile;
  equipment: Equipment;
  level: Level;
  usedInPlan: Set<string>;
  /** Esercizi del piano precedente: si preferiscono alternative per variare. */
  previous: Set<string>;
}

function pick(pattern: Pattern, ctx: Ctx, usedInSession: Set<string>): Exercise | undefined {
  const { level } = ctx;
  const score = (e: Exercise) =>
    (e.requires.length > 0 ? 3 : 0) +
    (e.difficulty === level.prefDiff ? 2 : -0.5 * Math.abs(e.difficulty - level.prefDiff)) -
    (ctx.usedInPlan.has(e.id) ? 4 : 0) -
    (ctx.previous.has(e.id) ? 2 : 0) -
    (e.unilateral ? 0.5 : 0);

  let best: Exercise | undefined;
  for (const e of EXERCISES) {
    if (e.pattern !== pattern || usedInSession.has(e.id) || e.difficulty > level.maxDiff) continue;
    if (!isAvailable(e, ctx.profile, ctx.equipment)) continue;
    if (!best || score(e) > score(best)) best = e;
  }
  return best;
}

function pickWithFallback(pattern: Pattern, ctx: Ctx, used: Set<string>): Exercise | undefined {
  for (const p of [pattern, ...(FALLBACK[pattern] ?? [])]) {
    const ex = pick(p, ctx, used);
    if (ex) return ex;
  }
  return undefined;
}

function prescribe(ex: Exercise, ctx: Ctx): Prescription {
  const dose = GOAL_DOSE[ctx.profile.goal];
  const { level } = ctx;
  const restSec = Math.max(20, dose.rest + level.restAdd);
  if (ex.timed) {
    return { exerciseId: ex.id, sets: level.sets, seconds: ex.pattern === 'cardio' ? level.cardio : level.hold, restSec };
  }
  const [lo, hi] = dose.reps;
  const p: Prescription = {
    exerciseId: ex.id,
    sets: level.sets,
    reps: Math.min(hi, lo + level.startAdd),
    repRange: [lo, hi],
    restSec,
  };
  if (ex.requires.includes('band')) p.bandId = chooseBand(ex.bandLoad ?? 'medium', ctx.equipment.bands, level.bandShift);
  return p;
}

function rotate<T>(list: T[], by: number): T[] {
  if (list.length === 0) return list;
  const k = by % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}

function warmupFor(count: number, offset: number, ctx: Ctx): string[] {
  const ok = EXERCISES.filter((e) => e.pattern === 'mobility' && isAvailable(e, ctx.profile, ctx.equipment)).map((e) => e.id);
  const first = ok.includes('mob-marcia') ? ['mob-marcia'] : [];
  const rest = rotate(ok.filter((id) => id !== 'mob-marcia'), offset * 2);
  return [...first, ...rest].slice(0, count);
}

function cooldownFor(count: number, offset: number, ctx: Ctx): string[] {
  const ok = EXERCISES.filter((e) => e.pattern === 'stretch' && isAvailable(e, ctx.profile, ctx.equipment)).map((e) => e.id);
  const last = ok.includes('st-respiro') ? ['st-respiro'] : [];
  const rest = rotate(ok.filter((id) => id !== 'st-respiro'), offset * 2);
  return [...rest.slice(0, count - last.length), ...last];
}

function seconds(s: SessionTemplate): number {
  return totalDuration(buildTimeline(s));
}

function buildSession(tpl: Template, index: number, schedule: Schedule, ctx: Ctx): SessionTemplate {
  const { minutes } = schedule;
  const mobility = ctx.profile.goal === 'mobilita' ? 2 : 0;
  const warmCount = (minutes <= 20 ? 3 : minutes <= 30 ? 4 : 5) + mobility;
  const coolCount = (minutes <= 20 ? 2 : minutes <= 30 ? 3 : 4) + mobility;
  const letter = LETTERS[index];
  const target = minutes * 60;

  let session: SessionTemplate = {
    id: letter,
    letter,
    title: tpl.title,
    warmup: warmupFor(warmCount, index, ctx),
    main: [],
    cooldown: cooldownFor(coolCount, index, ctx),
  };

  const used = new Set<string>();
  for (const slot of [...withCardio(tpl.slots, ctx.profile.goal), ...EXTRAS]) {
    const ex = pickWithFallback(slot, ctx, used);
    if (!ex) continue;
    const candidate = { ...session, main: [...session.main, prescribe(ex, ctx)] };
    if (seconds(candidate) <= target * 1.05) {
      session = candidate;
      used.add(ex.id);
    }
  }

  // Se avanza tempo, una serie in più agli esercizi, nell'ordine.
  const maxSets = ctx.level.sets + 1;
  let grew = true;
  while (grew) {
    grew = false;
    for (let i = 0; i < session.main.length; i++) {
      if (session.main[i].sets >= maxSets) continue;
      const main = session.main.map((p, j) => (j === i ? { ...p, sets: p.sets + 1 } : p));
      const candidate = { ...session, main };
      if (seconds(candidate) <= target) {
        session = candidate;
        grew = true;
      }
    }
  }

  for (const id of used) ctx.usedInPlan.add(id);
  return session;
}

export function generatePlan(profile: Profile, schedule: Schedule, equipment: Equipment, now = new Date(), previous?: Plan): Plan {
  const { name, templates } = splitFor(schedule.sessionsPerWeek);
  const ctx: Ctx = {
    profile,
    equipment,
    level: LEVELS[profile.experience],
    usedInPlan: new Set(),
    previous: new Set(previous?.sessions.flatMap((s) => s.main.map((p) => p.exerciseId))),
  };
  return {
    createdAt: now.toISOString(),
    weeks: 6,
    splitName: name,
    sessions: templates.map((tpl, i) => buildSession(tpl, i, schedule, ctx)),
  };
}
