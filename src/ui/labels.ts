import type { Experience, Gear, Goal, Limitation, Place, PlatformZone, Sex } from '../domain/types';

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
  ['forza', 'Forza'],
  ['resistenza', 'Resistenza'],
  ['mobilita', 'Mobilità'],
];

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
  ['manubri', 'Manubri'],
  ['trx', 'TRX o anelli'],
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
