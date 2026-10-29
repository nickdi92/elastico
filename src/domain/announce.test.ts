import { describe, expect, it } from 'vitest';
import { announcement } from './announce';
import { buildTimeline } from './timeline';
import { equipment, weights } from './__fixtures__';
import type { SessionTemplate } from './types';

const session: SessionTemplate = {
  id: 'A',
  letter: 'A',
  title: 'Test',
  warmup: ['mob-marcia', 'mob-braccia'],
  main: [
    { exerciseId: 'squat-elastico', sets: 2, reps: 12, repRange: [10, 15], restSec: 60, bandId: 'b-viola' },
    { exerciseId: 'affondo-indietro', sets: 1, reps: 8, repRange: [8, 12], restSec: 45 },
    { exerciseId: 'pushup-piatt-petto', sets: 1, reps: 10, repRange: [8, 12], restSec: 45 },
    { exerciseId: 'plank', sets: 1, seconds: 30, restSec: 30 },
  ],
  cooldown: ['st-femorali', 'st-respiro'],
};

const steps = buildTimeline(session);
const at = (pred: (i: number) => boolean) => announcement(steps, steps.findIndex((_, i) => pred(i)), equipment);

describe('announcement', () => {
  it('introduces the warm-up, then only names the next moves', () => {
    expect(announcement(steps, 0, equipment)).toBe('Riscaldamento. Marcia sul posto, 40 secondi.');
    expect(announcement(steps, 1, equipment)).toBe('Cerchi con le braccia.');
  });

  it('tells which band to pick before the first exercise', () => {
    expect(announcement(steps, 2, equipment)).toBe('Preparati. Si parte con squat con elastico: prendi l’elastico viola.');
  });

  it('announces sets and reps when work starts', () => {
    expect(announcement(steps, 3, equipment)).toBe('Squat con elastico. Serie 1 di 2, 12 ripetizioni. Via!');
  });

  it('keeps rests between sets short', () => {
    expect(announcement(steps, 4, equipment)).toBe('Riposo, 60 secondi.');
  });

  it('says what comes next when the exercise changes', () => {
    expect(announcement(steps, 6, equipment)).toBe('Riposo, 75 secondi. Poi affondo indietro.');
  });

  it('mentions sides for unilateral work', () => {
    expect(at((i) => steps[i].exerciseId === 'affondo-indietro' && steps[i].kind === 'work')).toBe(
      'Affondo indietro. 8 ripetizioni per lato. Via!',
    );
  });

  it('tells where to put the platform handles', () => {
    expect(at((i) => steps[i].kind === 'rest' && steps[i].next?.exerciseId === 'pushup-piatt-petto')).toBe(
      'Riposo, 60 secondi. Poi push-up su piattaforma, petto: maniglie sul rosso.',
    );
  });

  it('tells which weight to pick', () => {
    const withCurl: SessionTemplate = {
      ...session,
      warmup: [],
      main: [{ exerciseId: 'curl-manubri', sets: 1, reps: 10, repRange: [8, 12], restSec: 45, weightId: 'w-manubri-10' }],
    };
    expect(announcement(buildTimeline(withCurl), 0, { ...equipment, weights })).toBe('Preparati. Si parte con curl con manubri: manubri da 10 chili.');
  });

  it('announces holds in seconds', () => {
    expect(at((i) => steps[i].exerciseId === 'plank' && steps[i].kind === 'work')).toBe('Plank. 30 secondi. Via!');
  });

  it('introduces the cool-down', () => {
    expect(at((i) => steps[i].kind === 'cooldown')).toBe('Defaticamento. Allungamento posteriori coscia, 30 secondi per lato.');
  });
});
