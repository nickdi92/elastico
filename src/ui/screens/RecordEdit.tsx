import { useState } from 'preact/hooks';
import { estimateKcal } from '../../domain/calories';
import { type RecordDraft, applyDraft, draftOf, localDate } from '../../domain/history';
import { nextSessionIndex } from '../../domain/schedule';
import { buildTimeline, totalDuration } from '../../domain/timeline';
import type { Feedback, Plan, Profile, SessionTemplate, WorkoutRecord } from '../../domain/types';
import { NumberField, Seg } from '../components/controls';
import { IconCheck } from '../components/icons';

const FEEDBACK: [Feedback | '', string][] = [
  ['', 'Non so'],
  ['facile', 'Facile'],
  ['giusta', 'Giusta'],
  ['dura', 'Dura'],
];

/** Valori proposti per un allenamento del piano fatto senza l'app. */
function plannedDefaults(session: SessionTemplate, weightKg: number) {
  const steps = buildTimeline(session);
  const sets = steps.filter((s) => s.kind === 'work').length;
  return {
    minutes: Math.round(totalDuration(steps) / 60),
    kcalPerMin: estimateKcal(steps, weightKg) / (totalDuration(steps) / 60),
    setsDone: sets,
    setsTotal: sets,
  };
}

function inRange(v: number, min: number, max: number) {
  return Number.isFinite(v) && v >= min && v <= max;
}

interface Props {
  /** Assente = nuovo allenamento. */
  record?: WorkoutRecord;
  plan: Plan;
  profile: Profile;
  history: WorkoutRecord[];
  onSave: (r: WorkoutRecord) => void;
  onCancel: () => void;
}

export function RecordEdit({ record, plan, profile, history, onSave, onCancel }: Props) {
  const [base] = useState<WorkoutRecord>(() => {
    if (record) return record;
    const session = plan.sessions[nextSessionIndex(plan, history)];
    const d = plannedDefaults(session, profile.weightKg);
    return {
      id: `manuale-${Date.now()}`,
      sessionId: session.id,
      title: session.title,
      startedAt: new Date().toISOString(),
      durationSec: d.minutes * 60,
      kcal: Math.round(d.kcalPerMin * d.minutes),
      kcalSource: 'stima',
      setsDone: d.setsDone,
      setsTotal: d.setsTotal,
    };
  });
  const [draft, setDraft] = useState<RecordDraft>(() => draftOf(base));
  /** Nei nuovi allenamenti le calorie seguono durata e sessione finché non le scrivi tu. */
  const [kcalTouched, setKcalTouched] = useState(!!record);
  const set = (patch: Partial<RecordDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const options: { sessionId: string; title: string; letter?: string }[] = plan.sessions.map((s) => ({ sessionId: s.id, title: s.title, letter: s.letter }));
  if (!options.some((o) => o.sessionId === base.sessionId && o.title === base.title)) options.unshift({ sessionId: base.sessionId, title: base.title });

  const pickSession = (o: (typeof options)[number]) => {
    const session = plan.sessions.find((s) => s.id === o.sessionId && s.title === o.title);
    if (record || !session) return set({ sessionId: o.sessionId, title: o.title });
    const d = plannedDefaults(session, profile.weightKg);
    set({ sessionId: o.sessionId, title: o.title, minutes: d.minutes, setsDone: d.setsDone, setsTotal: d.setsTotal, ...(kcalTouched ? {} : { kcal: Math.round(d.kcalPerMin * d.minutes) }) });
  };

  const setMinutes = (minutes: number) => {
    if (kcalTouched || !Number.isFinite(minutes)) return set({ minutes });
    const session = plan.sessions.find((s) => s.id === draft.sessionId && s.title === draft.title);
    const perMin = session ? plannedDefaults(session, profile.weightKg).kcalPerMin : draft.kcal / Math.max(1, draft.minutes);
    set({ minutes, kcal: Math.round(perMin * minutes) });
  };

  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(draft.date) &&
    /^\d{2}:\d{2}$/.test(draft.time) &&
    inRange(draft.minutes, 1, 300) &&
    inRange(draft.kcal, 0, 5000) &&
    inRange(draft.setsTotal, 0, 99) &&
    inRange(draft.setsDone, 0, draft.setsTotal);

  return (
    <main class="screen no-tabs">
      <div>
        <div class="date">Storico</div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          {record ? 'Modifica allenamento' : 'Nuovo allenamento'}
        </h1>
        {!record && (
          <p class="lead" style={{ marginTop: 6 }}>
            Per un allenamento fatto senza l'app.
          </p>
        )}
      </div>

      <div class="field">
        <span class="label">Allenamento</span>
        <div class="list" role="radiogroup" aria-label="Allenamento">
          {options.map((o) => {
            const on = o.sessionId === draft.sessionId && o.title === draft.title;
            return (
              <button type="button" role="radio" aria-checked={on} class="row" key={`${o.sessionId}-${o.title}`} onClick={() => pickSession(o)}>
                <span class="letter">{o.letter ?? '·'}</span>
                {o.title}
                <span class="check">
                  <IconCheck />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div class="field">
        <span class="label">Quando</span>
        <div class="nums2">
          <label class="num when">
            <span>Giorno</span>
            <input type="date" value={draft.date} max={localDate(new Date())} onInput={(e) => set({ date: (e.target as HTMLInputElement).value })} />
          </label>
          <label class="num when">
            <span>Ora</span>
            <input type="time" value={draft.time} onInput={(e) => set({ time: (e.target as HTMLInputElement).value })} />
          </label>
        </div>
      </div>

      <div class="nums2">
        <NumberField label="Durata" unit="min" min={1} max={300} value={draft.minutes} onChange={setMinutes} />
        <NumberField
          label="Calorie"
          unit="kcal"
          min={0}
          max={5000}
          value={draft.kcal}
          onChange={(kcal) => {
            setKcalTouched(true);
            set({ kcal });
          }}
        />
        <NumberField label="Serie fatte" min={0} max={99} value={draft.setsDone} onChange={(setsDone) => set({ setsDone })} />
        <NumberField label="Serie previste" min={0} max={99} value={draft.setsTotal} onChange={(setsTotal) => set({ setsTotal })} />
      </div>
      {!kcalTouched && <p class="note">Calorie stimate da peso, durata e tipo di esercizio. Se le conosci, scrivile.</p>}

      <div class="field">
        <span class="label">Com'è andata?</span>
        <Seg label="Com'è andata" options={FEEDBACK} value={draft.feedback ?? ''} onChange={(v) => set({ feedback: v || undefined })} />
        <span class="hint">Resta solo nello storico: ripetizioni ed elastici del piano non cambiano.</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', paddingTop: 8 }}>
        <button type="button" class="btn" disabled={!valid} onClick={() => onSave(applyDraft(base, draft))}>
          Salva
        </button>
        <button type="button" class="link" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </main>
  );
}
