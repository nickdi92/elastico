import { describe, expect, it } from 'vitest';
import { generatePlan } from './planner';
import { buildTimeline, totalDuration } from './timeline';
import { getExercise } from './exercises';
import { bareEquipment, equipment, profile, schedule } from './__fixtures__';
import type { Plan } from './types';

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
