import type { BodyweightMix, Experience, Gear, Goal, Limitation, Muscle, Place, PlatformZone, Sex, WeightUse } from '../domain/types';

export const SEX_OPTIONS: [Sex, string][] = [
  ['M', 'Uomo'],
  ['F', 'Donna'],
  ['X', 'Altro'],
];

export const EXPERIENCE_OPTIONS: [Experience, string][] = [
  ['principiante', 'Quasi mai'],
  ['intermedio', 'A volte'],
  ['avanzato', 'Spesso'],
];

export const GOAL_OPTIONS: [Goal, string][] = [
  ['dimagrire', 'Dimagrire'],
  ['tonificare', 'Tonificare'],
  ['muscolo', 'Mettere muscolo'],
  ['forza', 'Forza'],
  ['resistenza', 'Resistenza'],
  ['mobilita', 'Mobilità'],
];

/** Cosa vuol dire ogni obiettivo nel piano (gli stessi numeri del planner). */
export const GOAL_HINTS: Record<Goal, string> = {
  dimagrire: 'Dimagrire: 12–20 ripetizioni, recuperi brevi e un po’ di cardio in mezzo.',
  tonificare: 'Tonificare: 10–15 ripetizioni, recuperi da un minuto, corpo asciutto e sodo.',
  muscolo: 'Mettere muscolo: 8–12 ripetizioni vicino al limite, recuperi più lunghi.',
  forza: 'Forza: 6–10 ripetizioni con il carico più duro che hai, recuperi lunghi.',
  resistenza: 'Resistenza: 15–20 ripetizioni, recuperi brevi, fiato e tenuta.',
  mobilita: 'Mobilità: più riscaldamento e allungamenti, carichi leggeri.',
};

export const MUSCLE_OPTIONS: [Muscle, string][] = [
  ['petto', 'Petto'],
  ['spalle', 'Spalle'],
  ['bicipiti', 'Bicipiti'],
  ['tricipiti', 'Tricipiti'],
  ['dorso', 'Dorso'],
  ['addominali', 'Addominali'],
  ['glutei', 'Glutei'],
  ['gambe', 'Gambe'],
];

export function muscleName(m: Muscle): string {
  return MUSCLE_OPTIONS.find(([k]) => k === m)![1];
}

/** "petto, spalle e bicipiti" */
export function joinList(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

export const LIMITATION_OPTIONS: [Limitation, string][] = [
  ['schiena', 'Schiena'],
  ['ginocchia', 'Ginocchia'],
  ['spalle', 'Spalle'],
  ['polsi', 'Polsi'],
];

export const GEAR_OPTIONS: [Gear, string][] = [
  ['tappetino', 'Tappetino'],
  ['ancoraggio', 'Ancoraggio porta'],
  ['gradino', 'Gradino o sedia'],
  ['sbarra', 'Sbarra trazioni'],
  ['trx', 'TRX o anelli'],
];

/** Pesi già pronti da scegliere; "Altro" lascia scrivere il nome e dire come si impugna. */
export const WEIGHT_KINDS: { key: string; name: string; use: WeightUse }[] = [
  { key: 'manubri', name: 'Manubri', use: 'manubri' },
  { key: 'kettlebell', name: 'Kettlebell', use: 'kettlebell' },
  { key: 'palla', name: 'Palla medica', use: 'peso' },
];

export const WEIGHT_USE_OPTIONS: [WeightUse, string][] = [
  ['manubri', 'In una mano'],
  ['kettlebell', 'Per la maniglia'],
  ['peso', 'Al petto'],
];

export const WEIGHT_USE_HINTS: Record<WeightUse, string> = {
  manubri: 'Come un manubrio: curl, alzate, rematore, spinte.',
  kettlebell: 'Come un kettlebell: swing, stacco, spinta a un braccio, goblet squat.',
  peso: 'A due mani al petto: goblet squat, affondi, pullover, russian twist.',
};

export const BODYWEIGHT_OPTIONS: [Exclude<BodyweightMix, 'off'>, string][] = [
  ['qualcuno', 'Qualcuno'],
  ['terzo', 'Un terzo'],
  ['meta', 'Metà'],
];

export const PLACE_OPTIONS: [Place, string][] = [
  ['dentro', 'Dentro'],
  ['fuori', 'Fuori'],
  ['entrambi', 'Entrambi'],
];

export const ZONE_OPTIONS: [PlatformZone, string][] = [
  ['petto', 'Petto'],
  ['spalle', 'Spalle'],
  ['tricipiti', 'Tricipiti'],
  ['dorso', 'Dorso'],
];

export const DAY_SHORT = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
export const DAY_NAMES = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

export const RESISTANCES: { kg: number; label: string }[] = [
  { kg: 3, label: 'Extra leggero' },
  { kg: 5, label: 'Leggero' },
  { kg: 10, label: 'Medio' },
  { kg: 15, label: 'Forte' },
  { kg: 20, label: 'Extra forte' },
  { kg: 30, label: 'Massimo' },
];

export function resistanceLabel(kg: number): string {
  const r = RESISTANCES.reduce((a, b) => (Math.abs(b.kg - kg) < Math.abs(a.kg - kg) ? b : a));
  return r.label.toLowerCase();
}

export const MINUTES_OPTIONS = [15, 20, 30, 45, 60];

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());
}
