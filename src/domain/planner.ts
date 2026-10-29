import { EXERCISES } from './exercises';
import { chooseLoad, compatibleWeights, isBodyweight } from './loads';
import { MUSCLE_PATTERNS, muscleOf } from './muscles';
import { buildTimeline, totalDuration } from './timeline';
import type {
  BodyweightMix,
  Equipment,
  Exercise,
  Experience,
  Goal,
  Muscle,
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
  muscolo: { reps: [8, 12], rest: 75 },
  dimagrire: { reps: [12, 20], rest: 30 },
  resistenza: { reps: [15, 20], rest: 30 },
  mobilita: { reps: [8, 12], rest: 45 },
};

/** Per i muscoli su cui insistere: ripetizioni da crescita, con il recupero dell'obiettivo se è più lungo. */
function focusDose(goal: Goal): Dose {
  if (goal === 'forza') return GOAL_DOSE.forza;
  return { reps: GOAL_DOSE.muscolo.reps, rest: Math.max(60, GOAL_DOSE[goal].rest) };
}

/** Quota degli esercizi principali da fare a corpo libero (il cardio non conta). */
const BODYWEIGHT_SHARE: Record<BodyweightMix, number> = { off: 0, qualcuno: 0.25, terzo: 1 / 3, meta: 0.5 };

/** Gli esercizi messi in testa per i muscoli su cui insistere occupano al massimo questa parte della sessione. */
const FOCUS_SHARE = 0.6;

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
  if (ex.weight && compatibleWeights(ex, eq.weights).length === 0) return false;
  return ex.requires.every((r) => {
    if (r === 'band') return eq.bands.length > 0;
    if (r === 'platform') return eq.platform !== null;
    return eq.gear.includes(r);
  });
}

interface Ctx {
  profile: Profile;
  equipment: Equipment;
  level: Level;
  focus: Set<Muscle>;
  usedInPlan: Set<string>;
  /** Esercizi del piano precedente: si preferiscono alternative per variare. */
  previous: Set<string>;
}

/** Per questo movimento: meglio a corpo libero? E tra elastici e pesi, quale tocca (si alternano)? */
interface Preference {
  bodyweight: boolean;
  weightsFirst: boolean;
}

function pick(pattern: Pattern, ctx: Ctx, usedInSession: Set<string>, pref: Preference): Exercise | undefined {
  const { level } = ctx;
  const gear = (e: Exercise) => (pref.bodyweight ? (isBodyweight(e) ? 5 : 0) : isBodyweight(e) ? 0 : 3);
  const turn = (e: Exercise) => ((pref.weightsFirst ? e.weight : e.requires.includes('band')) ? 0.5 : 0);
  const score = (e: Exercise) =>
    gear(e) +
    turn(e) +
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

function pickWithFallback(pattern: Pattern, ctx: Ctx, used: Set<string>, pref: Preference): Exercise | undefined {
  for (const p of [pattern, ...(FALLBACK[pattern] ?? [])]) {
    const ex = pick(p, ctx, used, pref);
    if (ex) return ex;
  }
  return undefined;
}

function isFocus(ex: Exercise, ctx: Ctx): boolean {
  const m = muscleOf(ex.pattern);
  return m !== undefined && ctx.focus.has(m);
}

/**
 * Serie di partenza e massime. Con dei muscoli su cui insistere il resto del corpo fa una serie in meno:
 * il tempo che avanza va a loro (più esercizi, più spesso), senza togliere parti del corpo.
 */
function setsFor(focus: boolean, ctx: Ctx): { start: number; max: number } {
  const { sets } = ctx.level;
  if (focus || ctx.focus.size === 0) return { start: sets, max: sets + 1 };
  return { start: Math.max(2, sets - 1), max: sets };
}

function prescribe(ex: Exercise, ctx: Ctx): Prescription {
  const focus = isFocus(ex, ctx);
  const dose = focus ? focusDose(ctx.profile.goal) : GOAL_DOSE[ctx.profile.goal];
  const { level } = ctx;
  const sets = setsFor(focus, ctx).start;
  const restSec = Math.max(20, dose.rest + level.restAdd);
  const p: Prescription = ex.timed
    ? { exerciseId: ex.id, sets, seconds: ex.pattern === 'cardio' ? level.cardio : level.hold, restSec }
    : { exerciseId: ex.id, sets, reps: Math.min(dose.reps[1], dose.reps[0] + level.startAdd), repRange: dose.reps, restSec };
  if (ex.requires.includes('band')) p.bandId = chooseLoad(ex.bandLoad ?? 'medium', ctx.equipment.bands, level.bandShift);
  if (ex.weight) p.weightId = chooseLoad(ex.weightLoad ?? 'medium', compatibleWeights(ex, ctx.equipment.weights), level.bandShift);
  if (focus) p.focus = true;
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

/**
 * Ordine in cui provare i movimenti. Con dei muscoli su cui insistere: prima un esercizio per ognuno
 * (al massimo `cap`, a rotazione tra le sessioni), poi il resto della sessione partendo dalle parti del
 * corpo non ancora toccate, poi un secondo esercizio per i muscoli scelti se avanza tempo.
 */
function prioritySlots(base: Pattern[], index: number, ctx: Ctx, cap: number): Pattern[] {
  const rest = [...base];
  const first: Pattern[] = [];
  const overflow: Pattern[] = [];
  const seconds: Pattern[] = [];
  rotate([...ctx.focus], index).forEach((m, k) => {
    const patterns = MUSCLE_PATTERNS[m];
    const at = rest.findIndex((p) => muscleOf(p) === m);
    if (k < cap) first.push(at >= 0 ? rest.splice(at, 1)[0] : patterns[index % patterns.length]);
    else if (at < 0) overflow.push(patterns[index % patterns.length]);
    seconds.push(patterns[(index + 1) % patterns.length]);
  });
  const covered = new Set(first.map(muscleOf));
  const fresh: Pattern[] = [];
  const repeat: Pattern[] = [];
  for (const p of rest) {
    const m = muscleOf(p);
    if (m && covered.has(m)) repeat.push(p);
    else {
      fresh.push(p);
      if (m) covered.add(m);
    }
  }
  return [...first, ...fresh, ...repeat, ...overflow, ...seconds, ...EXTRAS];
}

/** Riempie la sessione nell'ordine dato finché c'è tempo, alternando corpo libero e attrezzi nella quota scelta. */
function fill(start: SessionTemplate, slots: Pattern[], ctx: Ctx, target: number): { session: SessionTemplate; used: Set<string> } {
  const share = BODYWEIGHT_SHARE[ctx.equipment.bodyweight];
  let session = start;
  const used = new Set<string>();
  let counted = 0;
  let bodyweight = 0;
  let bands = 0;
  let weights = 0;
  for (const slot of slots) {
    const pref = {
      bodyweight: slot !== 'cardio' && bodyweight < Math.round(share * (counted + 1)),
      weightsFirst: weights < bands,
    };
    const ex = pickWithFallback(slot, ctx, used, pref);
    if (!ex) continue;
    const candidate = { ...session, main: [...session.main, prescribe(ex, ctx)] };
    if (seconds(candidate) > target * 1.05) continue;
    session = candidate;
    used.add(ex.id);
    if (ex.weight) weights++;
    if (ex.requires.includes('band')) bands++;
    if (ex.pattern !== 'cardio') {
      counted++;
      if (isBodyweight(ex)) bodyweight++;
    }
  }
  return { session, used };
}

function buildSession(tpl: Template, index: number, schedule: Schedule, ctx: Ctx): SessionTemplate {
  const { minutes } = schedule;
  const mobility = ctx.profile.goal === 'mobilita' ? 2 : 0;
  const warmCount = (minutes <= 20 ? 3 : minutes <= 30 ? 4 : 5) + mobility;
  const coolCount = (minutes <= 20 ? 2 : minutes <= 30 ? 3 : 4) + mobility;
  const letter = LETTERS[index];
  const target = minutes * 60;

  const empty: SessionTemplate = {
    id: letter,
    letter,
    title: tpl.title,
    warmup: warmupFor(warmCount, index, ctx),
    main: [],
    cooldown: cooldownFor(coolCount, index, ctx),
  };

  const base = withCardio(tpl.slots, ctx.profile.goal);
  let slots = [...base, ...EXTRAS];
  if (ctx.focus.size > 0) {
    // Quanti esercizi stanno nel tempo: i muscoli scelti ne prendono al massimo il 60%, il resto del corpo non sparisce.
    const fits = fill(empty, slots, ctx, target).session.main.length;
    slots = prioritySlots(base, index, ctx, Math.max(1, Math.ceil(fits * FOCUS_SHARE)));
  }
  const filled = fill(empty, slots, ctx, target);
  const { used } = filled;
  let session = filled.session;

  // Se avanza tempo, una serie in più agli esercizi: prima ai muscoli scelti, poi agli altri.
  const order = session.main.map((_, i) => i).sort((a, b) => Number(!!session.main[b].focus) - Number(!!session.main[a].focus));
  const maxSets = (p: Prescription) => setsFor(!!p.focus, ctx).max;
  let grew = true;
  while (grew) {
    grew = false;
    for (const i of order) {
      if (session.main[i].sets >= maxSets(session.main[i])) continue;
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
    focus: new Set(profile.focus),
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
