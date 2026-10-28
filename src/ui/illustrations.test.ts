import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../domain/exercises';
import { guideFor } from '../domain/guides';
import { ILLUSTRATIONS, illustrationSvg } from './illustrations';

describe('illustrations', () => {
  const withoutPhoto = EXERCISES.filter((e) => !guideFor(e.id).photo).map((e) => e.id);

  it.each(withoutPhoto.map((id) => [id]))('draws %s in at least two frames', (id) => {
    expect(ILLUSTRATIONS[id]?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('renders every frame as an svg', () => {
    for (const [id, frames] of Object.entries(ILLUSTRATIONS)) {
      frames.forEach((_, i) => {
        const svg = illustrationSvg(id, i, '#6B48A8');
        expect(svg.startsWith('<svg'), `${id} ${i}`).toBe(true);
        expect(svg).toContain('viewBox');
        expect(svg).not.toContain('NaN');
      });
    }
  });

  it('paints bands with the given colour', () => {
    expect(illustrationSvg('rematore-piedi', 0, '#E3383B')).toContain('#E3383B');
  });
});
