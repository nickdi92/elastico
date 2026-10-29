import { describe, expect, it } from 'vitest';
import { generatePlan } from './planner';
import { buildTimeline, totalDuration } from './timeline';
import { getExercise } from './exercises';
import { isBodyweight } from './loads';
import { GROWTH_SETS, muscleOf, weeklySets } from './muscles';
import { bareEquipment, equipment, profile, schedule, weights } from './__fixtures__';
import type { Muscle, Plan } from './types';

const mainIds = (plan: Plan) => plan.sessions.flatMap((s) => s.main.map((p) => p.exerciseId));
const allIds = (plan: Plan) =>
  plan.sessions.flatMap((s) => [...s.warmup, ...s.main.map((p) => p.exerciseId), ...s.cooldown]);

describe('generatePlan: structure', () => {
  it('alternates two sessions for 4 per week', () => {
    const plan = generatePlan(profile, schedule, equipment);
    expect(plan.sessions.map((s) => s.title)).toEqual(['Gambe e tirata', 'Spinta, spalle e core']);
  });

  it('uses full body sessions for 2 and 3 per week', () => {
    expect(generatePlan(profile, { ...schedule, sessionsPerWeek: 2 }, equipment).sessions).toHaveLength(2);
    const three = generatePlan(profile, { ...schedule, sessionsPerWeek: 3 }, equipment);
    expect(three.sessions.map((s) => s.letter)).toEqual(['A', 'B', 'C']);
    expect(three.sessions[0].title).toBe('Corpo intero');
  });

  it('uses legs, push, pull for 5 or 6 per week', () => {
    const plan = generatePlan(profile, { ...schedule, sessionsPerWeek: 6 }, equipment);
    expect(plan.sessions.map((s) => s.title)).toEqual(['Gambe', 'Spinta', 'Tirata']);
  });

  it('gives every session a warm-up and a cool-down', () => {
    for (const s of generatePlan(profile, schedule, equipment).sessions) {
      expect(s.warmup.length).toBeGreaterThan(0);
      expect(s.cooldown.length).toBeGreaterThan(0);
    }
  });

  it('never repeats an exercise inside a session', () => {
    for (const s of generatePlan(profile, schedule, equipment).sessions) {
      const ids = s.main.map((p) => p.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('generatePlan: safety and equipment', () => {
  it('drops exercises that clash with the user limitations', () => {
    const plan = generatePlan({ ...profile, limitations: ['schiena', 'ginocchia'] }, schedule, equipment);
    for (const id of allIds(plan)) {
      const ex = getExercise(id);
      expect(ex.avoid, id).not.toContain('schiena');
      expect(ex.avoid, id).not.toContain('ginocchia');
    }
  });

  it('only uses equipment the user has', () => {
    const plan = generatePlan(profile, schedule, bareEquipment);
    for (const id of mainIds(plan)) {
      expect(getExercise(id).requires, id).toEqual([]);
      expect(getExercise(id).weight, id).toBeUndefined();
    }
  });

  it('uses the platform and the bands when available', () => {
    const ids = mainIds(generatePlan(profile, schedule, equipment));
    expect(ids.some((id) => getExercise(id).requires.includes('platform'))).toBe(true);
    expect(ids.some((id) => getExercise(id).requires.includes('band'))).toBe(true);
  });

  it('keeps to small-space exercises inside the camper', () => {
    const plan = generatePlan({ ...profile, goal: 'dimagrire' }, schedule, equipment);
    for (const id of allIds(plan)) expect(getExercise(id).space, id).toBe('small');
  });

  it('allows large-space exercises outside', () => {
    const plan = generatePlan(
      { ...profile, goal: 'dimagrire', experience: 'avanzato' },
      { ...schedule, minutes: 45 },
      { ...equipment, place: 'fuori' },
    );
    expect(allIds(plan).some((id) => getExercise(id).space === 'large')).toBe(true);
  });

  it('keeps beginners away from the hardest exercises', () => {
    const plan = generatePlan({ ...profile, experience: 'principiante' }, schedule, equipment);
    for (const id of mainIds(plan)) expect(getExercise(id).difficulty, id).toBeLessThan(3);
  });
});

describe('generatePlan: bands', () => {
  it('gives the strongest band to heavy exercises and the lightest to light ones', () => {
    const plan = generatePlan(profile, schedule, equipment);
    const all = plan.sessions.flatMap((s) => s.main);
    const heavy = all.find((p) => getExercise(p.exerciseId).bandLoad === 'heavy');
    const light = all.find((p) => getExercise(p.exerciseId).bandLoad === 'light');
    expect(heavy?.bandId).toBe('b-viola');
    expect(light?.bandId).toBe('b-giallo');
  });

  it('starts beginners one band lighter on heavy exercises', () => {
    const plan = generatePlan({ ...profile, experience: 'principiante' }, schedule, equipment);
    const heavy = plan.sessions.flatMap((s) => s.main).find((p) => getExercise(p.exerciseId).bandLoad === 'heavy');
    expect(heavy?.bandId).toBe('b-rosso');
  });
});

describe('generatePlan: dosage', () => {
  const firstReps = (plan: Plan) => plan.sessions[0].main.find((p) => p.reps)!;

  it('uses fewer reps and longer rests for strength than for toning', () => {
    const forza = firstReps(generatePlan({ ...profile, goal: 'forza' }, schedule, equipment));
    const tono = firstReps(generatePlan(profile, schedule, equipment));
    expect(forza.reps!).toBeLessThan(tono.reps!);
    expect(forza.restSec).toBeGreaterThan(tono.restSec);
  });

  it('uses short rests and cardio for weight loss', () => {
    const plan = generatePlan({ ...profile, goal: 'dimagrire' }, schedule, equipment);
    expect(plan.sessions[0].main[0].restSec).toBeLessThanOrEqual(45);
    expect(mainIds(plan).some((id) => getExercise(id).pattern === 'cardio')).toBe(true);
  });

  it('gives beginners fewer sets than advanced users', () => {
    const beg = generatePlan({ ...profile, experience: 'principiante' }, schedule, equipment);
    const adv = generatePlan({ ...profile, experience: 'avanzato' }, schedule, equipment);
    expect(beg.sessions[0].main[0].sets).toBeLessThan(adv.sessions[0].main[0].sets);
  });

  it.each([15, 20, 30, 45, 60])('fits a %i minute session', (minutes) => {
    const plan = generatePlan(profile, { ...schedule, minutes }, equipment);
    for (const s of plan.sessions) {
      const sec = totalDuration(buildTimeline(s));
      expect(sec / 60).toBeGreaterThanOrEqual(minutes * 0.8);
      expect(sec / 60).toBeLessThanOrEqual(minutes * 1.1);
    }
  });
});

describe('generatePlan: regenerating', () => {
  it('prefers exercises that were not in the previous plan', () => {
    const first = generatePlan(profile, schedule, equipment);
    const second = generatePlan(profile, schedule, equipment, new Date(), first);
    const before = new Set(mainIds(first));
    const fresh = mainIds(second).filter((id) => !before.has(id));
    expect(fresh.length).toBeGreaterThan(0);
  });
});

describe('generatePlan: weights', () => {
  const gear = { ...equipment, weights };
  const all = (plan: Plan) => plan.sessions.flatMap((s) => s.main);

  it('uses the weights the user owns and says which one to take', () => {
    const withWeight = all(generatePlan(profile, schedule, gear)).filter((p) => getExercise(p.exerciseId).weight);
    expect(withWeight.length).toBeGreaterThan(0);
    for (const p of withWeight) {
      const w = weights.find((x) => x.id === p.weightId);
      expect(w, p.exerciseId).toBeDefined();
      expect(getExercise(p.exerciseId).weight, p.exerciseId).toContain(w!.use);
    }
  });

  it('works with a single odd object held at the chest', () => {
    const zaino = { ...bareEquipment, weights: [weights[3]] };
    const ids = mainIds(generatePlan(profile, schedule, zaino));
    const weighted = ids.filter((id) => getExercise(id).weight);
    expect(weighted.length).toBeGreaterThan(0);
    for (const id of weighted) expect(getExercise(id).weight, id).toContain('peso');
  });

  it('gives the heavier dumbbells to heavy exercises and the lighter ones to light exercises', () => {
    const dumbbells = { ...bareEquipment, weights: weights.slice(0, 2) };
    const ps = all(generatePlan({ ...profile, focus: ['bicipiti', 'spalle'] }, { ...schedule, minutes: 45 }, dumbbells));
    const heavy = ps.find((p) => getExercise(p.exerciseId).weightLoad === 'heavy');
    const light = ps.find((p) => getExercise(p.exerciseId).weightLoad === 'light');
    expect(heavy?.weightId).toBe('w-manubri-10');
    expect(light?.weightId).toBe('w-manubri-4');
  });
});

describe('generatePlan: muscles to grow', () => {
  const focus: Muscle[] = ['petto', 'spalle', 'bicipiti', 'addominali'];
  const gear = { ...equipment, weights };

  it('trains every chosen muscle more than without a focus', () => {
    const plain = weeklySets(generatePlan(profile, schedule, gear), schedule);
    const focused = weeklySets(generatePlan({ ...profile, focus }, schedule, gear), schedule);
    for (const m of focus) expect(focused[m], m).toBeGreaterThan(plain[m]);
  });

  it('reaches the growth threshold with four 45 minute sessions', () => {
    const s = { ...schedule, minutes: 45 };
    const sets = weeklySets(generatePlan({ ...profile, focus }, s, gear), s);
    for (const m of focus) expect(sets[m], m).toBeGreaterThanOrEqual(GROWTH_SETS);
  });

  it('puts a chosen muscle at the start of every session, with growth reps', () => {
    const plan = generatePlan({ ...profile, focus: ['bicipiti'] }, schedule, gear);
    for (const s of plan.sessions) {
      const first = s.main[0];
      expect(muscleOf(getExercise(first.exerciseId).pattern), s.title).toBe('bicipiti');
      expect(first.focus).toBe(true);
      expect(first.repRange).toEqual([8, 12]);
    }
  });

  it('keeps training the rest of the body', () => {
    const plan = generatePlan({ ...profile, focus }, schedule, gear);
    const others = mainIds(plan).filter((id) => {
      const m = muscleOf(getExercise(id).pattern);
      return m && !focus.includes(m);
    });
    expect(new Set(others.map((id) => muscleOf(getExercise(id).pattern))).size).toBeGreaterThanOrEqual(3);
  });

  it.each([15, 20, 30, 45, 60])('still fits a %i minute session', (minutes) => {
    const plan = generatePlan({ ...profile, focus }, { ...schedule, minutes }, gear);
    for (const s of plan.sessions) {
      const sec = totalDuration(buildTimeline(s));
      expect(sec / 60).toBeGreaterThanOrEqual(minutes * 0.8);
      expect(sec / 60).toBeLessThanOrEqual(minutes * 1.1);
    }
  });
});

describe('generatePlan: bodyweight mix', () => {
  const gear = { ...equipment, weights };
  const share = (plan: Plan) => {
    const ids = mainIds(plan).filter((id) => getExercise(id).pattern !== 'cardio');
    return ids.filter((id) => isBodyweight(getExercise(id))).length / ids.length;
  };

  it('prefers equipment when the mix is off', () => {
    expect(share(generatePlan(profile, schedule, gear))).toBeLessThan(0.25);
  });

  it('mixes in about a third, or half, of bodyweight exercises', () => {
    expect(share(generatePlan(profile, schedule, { ...gear, bodyweight: 'terzo' }))).toBeGreaterThanOrEqual(0.25);
    expect(share(generatePlan(profile, schedule, { ...gear, bodyweight: 'meta' }))).toBeGreaterThanOrEqual(0.4);
  });

  it('puts at least one bodyweight exercise in every session', () => {
    for (const s of generatePlan(profile, schedule, { ...gear, bodyweight: 'terzo' }).sessions) {
      expect(s.main.some((p) => isBodyweight(getExercise(p.exerciseId))), s.title).toBe(true);
    }
  });
});
