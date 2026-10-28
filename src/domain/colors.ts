import { getExercise } from './exercises';
import type { ColorId, Equipment, Step } from './types';

export interface Theme {
  from: string;
  mid: string;
  to: string;
  text: string;
}

const DARK = '#1C1C1E';
const LIGHT = '#FFFFFF';

export const COLORS: Record<ColorId, { name: string; hex: string; from: string; to: string }> = {
  giallo: { name: 'Giallo', hex: '#F7D21E', from: '#FFEC8F', to: '#E2AE00' },
  arancione: { name: 'Arancione', hex: '#F28C28', from: '#FFB86B', to: '#C8650E' },
  rosso: { name: 'Rosso', hex: '#E3383B', from: '#F37A78', to: '#A51D2B' },
  rosa: { name: 'Rosa', hex: '#EC6FA4', from: '#F7A8C9', to: '#B83E74' },
  viola: { name: 'Viola', hex: '#6B48A8', from: '#9673DA', to: '#3F2470' },
  blu: { name: 'Blu', hex: '#2F6FDE', from: '#6FA0F2', to: '#1B47A0' },
  verde: { name: 'Verde', hex: '#2E9E5B', from: '#6CCB8F', to: '#1B6B3B' },
  grigio: { name: 'Grigio', hex: '#8A8F98', from: '#B8BCC4', to: '#5D626B' },
  nero: { name: 'Nero', hex: '#2A2A2E', from: '#55555C', to: '#111114' },
};

export const COLOR_IDS = Object.keys(COLORS) as ColorId[];

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Sceglie bianco o quasi-nero in base al contrasto più alto. */
export function textOn(hex: string): string {
  const l = luminance(hex);
  const vsLight = 1.05 / (l + 0.05);
  const vsDark = (l + 0.05) / (luminance(DARK) + 0.05);
  return vsDark > vsLight ? DARK : LIGHT;
}

function themeOf(id: ColorId): Theme {
  const c = COLORS[id];
  return { from: c.from, mid: c.hex, to: c.to, text: textOn(c.hex) };
}

export const THEMES: Record<'ink' | 'night' | 'dawn', Theme> = {
  ink: { from: '#4B3F8C', mid: '#2E2360', to: '#191233', text: LIGHT },
  night: { from: '#141B3D', mid: '#263A73', to: '#5E86C2', text: LIGHT },
  dawn: { from: '#F3796B', mid: '#F7A36C', to: '#FBD18E', text: '#3A1730' },
};

export function bandColor(equipment: Equipment, bandId: string | undefined): ColorId | undefined {
  return equipment.bands.find((b) => b.id === bandId)?.color;
}

export function stepTheme(step: Step, equipment: Equipment): Theme {
  if (step.kind === 'rest') return THEMES.night;
  if (step.kind !== 'work') return THEMES.dawn;
  const band = bandColor(equipment, step.bandId);
  if (band) return themeOf(band);
  const zone = getExercise(step.exerciseId).platformZone;
  if (zone && equipment.platform) return themeOf(equipment.platform.zoneColors[zone]);
  return THEMES.ink;
}
