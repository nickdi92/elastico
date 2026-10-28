import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from './exercises';
import { GUIDES, guideFor } from './guides';

const photoPath = (stem: string, frame: number) => new URL(`../../public/exercises/${stem}-${frame}.jpg`, import.meta.url);

describe('guides', () => {
  it.each(EXERCISES.map((e) => [e.id]))('explains %s in plain steps', (id) => {
    const g = guideFor(id);
    expect(g.muscles.length).toBeGreaterThan(0);
    expect(g.steps.length).toBeGreaterThanOrEqual(3);
    expect(g.tip.length).toBeGreaterThan(0);
  });

  it('has both photo frames on disk for every guide with a photo', () => {
    for (const [id, g] of Object.entries(GUIDES)) {
      if (!g.photo) continue;
      expect(existsSync(photoPath(g.photo, 0)), `${id} frame 0`).toBe(true);
      expect(existsSync(photoPath(g.photo, 1)), `${id} frame 1`).toBe(true);
    }
  });

  it('has no guides for unknown exercises', () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const id of Object.keys(GUIDES)) expect(ids.has(id), id).toBe(true);
  });
});
