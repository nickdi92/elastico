import { useState } from 'preact/hooks';
import { COLORS } from '../../domain/colors';
import { getExercise } from '../../domain/exercises';
import { weekday } from '../../domain/schedule';
import { buildTimeline, describeDose, totalDuration } from '../../domain/timeline';
import type { Equipment, Plan, Schedule, SessionTemplate } from '../../domain/types';
import { BandTag } from '../components/Equipment';
import { ExerciseSheet, type ExerciseSheetTarget } from '../components/ExerciseSheet';
import { PlatformIcon } from '../components/icons';
import { DAY_SHORT } from '../labels';

/** Esercizi di riscaldamento o defaticamento, ognuno apribile. */
function EasyList({ title, ids, onOpen }: { title: string; ids: string[]; onOpen: (t: ExerciseSheetTarget) => void }) {
  return (
    <div class="ex-row">
      <span class="icon" />
      <div>
        {title}
        <div class="dose">
          {ids.map((id, i) => (
            <span key={id}>
              {i > 0 && ', '}
              <button type="button" class="ex-link" onClick={() => onOpen({ exerciseId: id })}>
                {getExercise(id).name.toLowerCase()}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SessionCard({ session, equipment, onOpen }: { session: SessionTemplate; equipment: Equipment; onOpen: (t: ExerciseSheetTarget) => void }) {
  const minutes = Math.round(totalDuration(buildTimeline(session)) / 60);
  return (
    <section class="card">
      <div class="eyebrow">
        Allenamento {session.letter}, circa {minutes} minuti
      </div>
      <h2 class="title-l" style={{ marginTop: 3, marginBottom: 6 }}>
        {session.title}
      </h2>
      <EasyList title="Riscaldamento" ids={session.warmup} onOpen={onOpen} />
      {session.main.map((p) => {
        const ex = getExercise(p.exerciseId);
        const zone = ex.platformZone && equipment.platform ? equipment.platform.zoneColors[ex.platformZone] : undefined;
        return (
          <button type="button" class="ex-row" key={p.exerciseId} onClick={() => onOpen({ exerciseId: p.exerciseId, prescription: p })}>
            <span class="icon">{p.bandId ? <BandTag equipment={equipment} bandId={p.bandId} /> : zone ? <PlatformIcon handles={zone} /> : null}</span>
            <div>
              {ex.name}
              <div class="dose">
                {describeDose(p)}, recupero {p.restSec} secondi
                {p.bandId && `, elastico ${COLORS[equipment.bands.find((b) => b.id === p.bandId)!.color].name.toLowerCase()}`}
              </div>
            </div>
            <span class="chev" aria-hidden="true">
              ›
            </span>
          </button>
        );
      })}
      <EasyList title="Defaticamento" ids={session.cooldown} onOpen={onOpen} />
    </section>
  );
}

/** Lettera dell'allenamento per ogni giorno preferito della settimana. */
function weekLetters(plan: Plan, schedule: Schedule): (string | null)[] {
  const out: (string | null)[] = Array(7).fill(null);
  schedule.days.forEach((d, i) => {
    out[d] = plan.sessions[i % plan.sessions.length].letter;
  });
  return out;
}

export function PlanView({ plan, schedule, equipment, fresh, onHome, onEdit, onRegenerate }: { plan: Plan; schedule: Schedule; equipment: Equipment; fresh: boolean; onHome: () => void; onEdit: () => void; onRegenerate: () => void }) {
  const letters = weekLetters(plan, schedule);
  const today = weekday(new Date());
  const [open, setOpen] = useState<ExerciseSheetTarget | null>(null);
  return (
    <main class={`screen${fresh ? ' no-tabs' : ''}`}>
      <div>
        <div class="date">
          {plan.splitName}, {plan.weeks} settimane
        </div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          {fresh ? 'Il tuo piano è pronto' : 'Il tuo piano'}
        </h1>
        <p class="lead" style={{ marginTop: 6 }}>
          {schedule.sessionsPerWeek} allenamenti da {schedule.minutes} minuti a settimana. Tocca un esercizio per vedere come si fa.
        </p>
      </div>
      <div class="plan-week" aria-label="Settimana tipo">
        {DAY_SHORT.map((d, i) => (
          <div key={i} class={i === today ? 'today' : ''}>
            {d}
            <b>{letters[i] ?? '·'}</b>
          </div>
        ))}
      </div>
      {plan.sessions.map((s) => (
        <SessionCard key={s.id} session={s} equipment={equipment} onOpen={setOpen} />
      ))}
      <div class="card note" style={{ padding: 14 }}>
        <b style={{ color: 'var(--text)' }}>Come cresce il piano.</b> A fine allenamento ti chiediamo com'è andata. Se è stato facile aggiungiamo ripetizioni e poi passiamo a un elastico più forte; se è stato duro alleggeriamo.
      </div>
      <p class="disclaimer">
        Piano indicativo, costruito su regole generali di allenamento. Non sostituisce un personal trainer né il parere del medico. Fermati se senti dolore.
      </p>
      {fresh ? (
        <button type="button" class="btn" onClick={onHome}>
          Vai alla home
        </button>
      ) : (
        <div class="list">
          <button type="button" class="row link" onClick={onEdit}>
            Modifica i miei dati
          </button>
          <button type="button" class="row link" onClick={onRegenerate}>
            Rigenera il piano
          </button>
        </div>
      )}
      {open && <ExerciseSheet {...open} equipment={equipment} onClose={() => setOpen(null)} />}
    </main>
  );
}
