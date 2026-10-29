import type { Band, Equipment, Profile, Schedule, Weight } from './types';

export const profile: Profile = {
  sex: 'M',
  age: 38,
  heightCm: 178,
  weightKg: 76,
  experience: 'intermedio',
  goal: 'tonificare',
  focus: [],
  limitations: [],
};

export const schedule: Schedule = { sessionsPerWeek: 4, minutes: 30, days: [0, 2, 4, 5] };

export const bands: Band[] = [
  { id: 'b-giallo', color: 'giallo', kg: 5 },
  { id: 'b-rosso', color: 'rosso', kg: 11 },
  { id: 'b-viola', color: 'viola', kg: 20 },
];

export const equipment: Equipment = {
  bands,
  platform: { zoneColors: { petto: 'rosso', spalle: 'blu', tricipiti: 'verde', dorso: 'giallo' } },
  weights: [],
  gear: ['tappetino', 'gradino'],
  bodyweight: 'off',
  place: 'dentro',
};

export const weights: Weight[] = [
  { id: 'w-manubri-4', name: 'Manubri', use: 'manubri', kg: 4 },
  { id: 'w-manubri-10', name: 'Manubri', use: 'manubri', kg: 10 },
  { id: 'w-kettlebell', name: 'Kettlebell', use: 'kettlebell', kg: 8 },
  { id: 'w-zaino', name: 'Zaino con libri', use: 'peso', kg: 6 },
];

export const bareEquipment: Equipment = { bands: [], platform: null, weights: [], gear: [], bodyweight: 'off', place: 'dentro' };
