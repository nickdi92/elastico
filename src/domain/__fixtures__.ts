import type { Band, Equipment, Profile, Schedule } from './types';

export const profile: Profile = {
  sex: 'M',
  age: 38,
  heightCm: 178,
  weightKg: 76,
  experience: 'intermedio',
  goal: 'tonificare',
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
  gear: ['tappetino', 'gradino'],
  place: 'dentro',
};

export const bareEquipment: Equipment = { bands: [], platform: null, gear: [], place: 'dentro' };
