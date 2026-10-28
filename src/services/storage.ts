import type { Equipment, Plan, Profile, Schedule, WorkoutRecord } from '../domain/types';

const KEY = 'elastico:v1';
const VERSION = 1;

export interface Settings {
  voice: boolean;
  sounds: boolean;
  repTicks: boolean;
}

export interface AppState {
  version: number;
  profile: Profile | null;
  schedule: Schedule | null;
  equipment: Equipment | null;
  plan: Plan | null;
  history: WorkoutRecord[];
  settings: Settings;
}

export const DEFAULT_STATE: AppState = {
  version: VERSION,
  profile: null,
  schedule: null,
  equipment: null,
  plan: null,
  history: [],
  settings: { voice: true, sounds: true, repTicks: true },
};

export function parseState(raw: string | null): AppState {
  if (!raw) return DEFAULT_STATE;
  try {
    const data = JSON.parse(raw) as Partial<AppState>;
    if (data.version !== VERSION) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...data, settings: { ...DEFAULT_STATE.settings, ...data.settings } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function loadState(): AppState {
  try {
    return parseState(localStorage.getItem(KEY));
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Memoria piena o accesso negato: l'app continua a funzionare per questa sessione.
  }
}
