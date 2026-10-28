import type { PlayerState } from './player';
import type { SessionTemplate } from './types';

/** Conteggi accumulati durante l'allenamento. */
export interface WorkoutTotals {
  kcal: number;
  activeSec: number;
  hrSec: number;
  sampleClock: number;
  samples: number[];
  /** Indici dei passi di lavoro fatti. */
  workDone: number[];
}

/** Allenamento iniziato e non ancora finito, salvato per riprenderlo più tardi. */
export interface ActiveWorkout {
  /** Copia della sessione: il piano può cambiare mentre l'allenamento è in pausa. */
  session: SessionTemplate;
  startedAt: string;
  player: PlayerState;
  totals: WorkoutTotals;
  /** ms epoch dell'ultimo salvataggio. */
  savedAt: number;
}
