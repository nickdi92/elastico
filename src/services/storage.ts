import type { ActiveWorkout } from '../domain/activeWorkout';
import { pause } from '../domain/player';
import type { Equipment, Plan, Profile, Schedule, WorkoutRecord } from '../domain/types';

const KEY = 'elastico:v1';
/** Chiave separata: l'allenamento in corso si salva spesso, senza riscrivere tutto lo stato. */
const ACTIVE_KEY = 'elastico:active';
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

/** Se l'app è stata chiusa mentre il timer andava, l'allenamento riparte in pausa dall'ultimo salvataggio. */
export function parseActive(raw: string | null): ActiveWorkout | null {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw) as ActiveWorkout;
    if (!a?.session?.main || !a.player || !a.totals || typeof a.savedAt !== 'number') return null;
    return a.player.pausedAt === null ? { ...a, player: pause(a.player, a.savedAt) } : a;
  } catch {
    return null;
  }
}

export function loadActive(): ActiveWorkout | null {
  try {
    return parseActive(localStorage.getItem(ACTIVE_KEY));
  } catch {
    return null;
  }
}

export function saveActive(active: ActiveWorkout): void {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
  } catch {
    // Come saveState: si perde solo la possibilità di riprendere dopo una chiusura.
  }
}

export function clearActive(): void {
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Niente da fare.
  }
}
