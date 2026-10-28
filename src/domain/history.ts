import type { Feedback, WorkoutRecord } from './types';

/** Campi modificabili di un allenamento nello storico, come li mostra il modulo. */
export interface RecordDraft {
  sessionId: string;
  title: string;
  /** AAAA-MM-GG, ora locale. */
  date: string;
  /** HH:MM, ora locale. */
  time: string;
  minutes: number;
  kcal: number;
  setsDone: number;
  setsTotal: number;
  feedback?: Feedback;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function draftOf(r: WorkoutRecord): RecordDraft {
  const d = new Date(r.startedAt);
  return {
    sessionId: r.sessionId,
    title: r.title,
    date: localDate(d),
    time: localTime(d),
    minutes: Math.round(r.durationSec / 60),
    kcal: r.kcal,
    setsDone: r.setsDone,
    setsTotal: r.setsTotal,
    feedback: r.feedback,
  };
}

/** Applica le modifiche; i campi lasciati com'erano tengono il valore preciso (secondi, fonte delle calorie). */
export function applyDraft(base: WorkoutRecord, draft: RecordDraft): WorkoutRecord {
  const before = draftOf(base);
  const moved = draft.date !== before.date || draft.time !== before.time;
  return {
    ...base,
    sessionId: draft.sessionId,
    title: draft.title,
    startedAt: moved ? new Date(`${draft.date}T${draft.time}`).toISOString() : base.startedAt,
    durationSec: draft.minutes !== before.minutes ? draft.minutes * 60 : base.durationSec,
    kcal: draft.kcal,
    kcalSource: draft.kcal !== base.kcal ? 'stima' : base.kcalSource,
    setsDone: draft.setsDone,
    setsTotal: draft.setsTotal,
    feedback: draft.feedback,
  };
}

/** Aggiunge o sostituisce (stesso id) e tiene lo storico in ordine di data. */
export function upsertRecord(history: WorkoutRecord[], record: WorkoutRecord): WorkoutRecord[] {
  return [...history.filter((r) => r.id !== record.id), record].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
}

export function removeRecord(history: WorkoutRecord[], id: string): WorkoutRecord[] {
  return history.filter((r) => r.id !== id);
}
