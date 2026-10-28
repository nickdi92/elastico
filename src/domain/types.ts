export type Sex = 'M' | 'F' | 'X';
export type Experience = 'principiante' | 'intermedio' | 'avanzato';
export type Goal = 'dimagrire' | 'tonificare' | 'forza' | 'resistenza' | 'mobilita';
export type Limitation = 'schiena' | 'ginocchia' | 'spalle' | 'polsi';
export type Place = 'dentro' | 'fuori' | 'entrambi';
/** Attrezzi extra oltre a elastici e piattaforma. */
export type Gear = 'tappetino' | 'ancoraggio' | 'sbarra' | 'manubri' | 'gradino' | 'trx';
export type PlatformZone = 'petto' | 'spalle' | 'tricipiti' | 'dorso';
export type ColorId =
  | 'giallo'
  | 'arancione'
  | 'rosso'
  | 'rosa'
  | 'viola'
  | 'blu'
  | 'verde'
  | 'grigio'
  | 'nero';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  experience: Experience;
  goal: Goal;
  limitations: Limitation[];
}

export interface Schedule {
  sessionsPerWeek: number;
  minutes: number;
  /** 0 = lunedì … 6 = domenica */
  days: number[];
}

export interface Band {
  id: string;
  color: ColorId;
  /** Resistenza indicativa in kg, come da etichetta. */
  kg: number;
}

export interface Equipment {
  bands: Band[];
  platform: { zoneColors: Record<PlatformZone, ColorId> } | null;
  gear: Gear[];
  place: Place;
}

export type Pattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'glutes'
  | 'pushH'
  | 'pushV'
  | 'raise'
  | 'pullH'
  | 'pullV'
  | 'rearDelt'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'calves'
  | 'cardio'
  | 'mobility'
  | 'stretch';

export type BandLoad = 'light' | 'medium' | 'heavy';

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  /** Attrezzi tutti necessari. 'band' = almeno un elastico, 'platform' = piattaforma push-up. */
  requires: Array<Gear | 'band' | 'platform'>;
  bandLoad?: BandLoad;
  platformZone?: PlatformZone;
  /** 'large' = serve spazio (o si salta): solo fuori. */
  space: 'small' | 'large';
  avoid: Limitation[];
  difficulty: 1 | 2 | 3;
  unilateral?: boolean;
  /** Esercizio a tempo (tenuta) invece che a ripetizioni. */
  timed?: boolean;
  /** Secondi per ripetizione (eccentrica + concentrica). */
  repSec: number;
  cadence: string;
  setup: string;
  met: number;
}

export interface Prescription {
  exerciseId: string;
  sets: number;
  reps?: number;
  repRange?: [number, number];
  seconds?: number;
  restSec: number;
  bandId?: string;
}

export interface SessionTemplate {
  id: string;
  letter: string;
  title: string;
  warmup: string[];
  main: Prescription[];
  cooldown: string[];
}

export interface Plan {
  createdAt: string;
  weeks: number;
  splitName: string;
  sessions: SessionTemplate[];
}

export type Feedback = 'facile' | 'giusta' | 'dura';

export interface WorkoutRecord {
  id: string;
  sessionId: string;
  title: string;
  startedAt: string;
  durationSec: number;
  kcal: number;
  kcalSource: 'battito' | 'stima';
  avgHr?: number;
  maxHr?: number;
  /** Un campione ogni 5 secondi. */
  hrSamples?: number[];
  setsDone: number;
  setsTotal: number;
  feedback?: Feedback;
}

export type StepKind = 'warmup' | 'work' | 'rest' | 'cooldown';

export interface Step {
  kind: StepKind;
  exerciseId: string;
  name: string;
  durationSec: number;
  met: number;
  /** Posizione dell'esercizio nella parte principale (1-based); 0 per riscaldamento e defaticamento. */
  exerciseNo: number;
  exerciseCount: number;
  set?: number;
  totalSets?: number;
  reps?: number;
  repSec?: number;
  sides?: 1 | 2;
  bandId?: string;
  /** Per i riposi: cosa arriva dopo. */
  next?: { exerciseId: string; name: string; detail: string; bandId?: string; setup: string };
}
