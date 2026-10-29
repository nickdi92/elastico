import { useState } from 'preact/hooks';
import { COLORS } from '../../domain/colors';
import { getExercise } from '../../domain/exercises';
import { findWeight, formatKg, isBodyweight } from '../../domain/loads';
import { GROWTH_SETS, MUSCLES, weeklySets } from '../../domain/muscles';
import { weekday } from '../../domain/schedule';
import { buildTimeline, describeDose, totalDuration } from '../../domain/timeline';
import type { Equipment, Muscle, Plan, Prescription, Schedule, SessionTemplate } from '../../domain/types';
import { BandTag, WeightTag } from '../components/Equipment';
import { ExerciseSheet, type ExerciseSheetTarget } from '../components/ExerciseSheet';
import { PlatformIcon } from '../components/icons';
import { DAY_SHORT, joinList, muscleName } from '../labels';

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

/** Con cosa si fa: elastico, peso o corpo libero (la piattaforma si vede già dal nome). */
function gearText(p: Prescription, equipment: Equipment): string {
  const band = equipment.bands.find((b) => b.id === p.bandId);
  if (band) return `, elastico ${COLORS[band.color].name.toLowerCase()}`;
  const weight = findWeight(equipment, p.weightId);
  if (weight) return `, ${weight.name.toLowerCase()} ${formatKg(weight.kg)}`;
  return isBodyweight(getExercise(p.exerciseId)) ? ', corpo libero' : '';
}

/** Serie dirette a settimana per muscolo: i muscoli scelti in evidenza, la soglia di crescita come riferimento. */
function VolumeCard({ plan, schedule, focus }: { plan: Plan; schedule: Schedule; focus: Muscle[] }) {
  const sets = weeklySets(plan, schedule);
  const rows = [...focus, ...MUSCLES.filter((m) => !focus.includes(m))];
  const max = Math.max(GROWTH_SETS + 4, ...rows.map((m) => sets[m]));
  const low = focus.filter((m) => sets[m] < GROWTH_SETS).map((m) => muscleName(m).toLowerCase());
  return (
    <section class="card">
      <div class="eyebrow">Serie a settimana per muscolo</div>
      <div class="vol" style={{ '--mark': `${(GROWTH_SETS / max) * 100}%` }}>
        {rows.map((m) => (
          <div key={m} class={`vol-row${focus.includes(m) ? ' on' : ''}`}>
            <span>{muscleName(m)}</span>
            <i>{sets[m] > 0 && <b style={{ width: `${(sets[m] / max) * 100}%` }} />}</i>
            <em>{sets[m]}</em>
          </div>
        ))}
      </div>
      <p class="vol-note">
        La linea tratteggiata è a {GROWTH_SETS} serie: da lì in su un muscolo cresce, sotto si mantiene.
        {focus.length === 0 && ' Per insistere su qualche muscolo, sceglilo in Modifica i miei dati.'}
        {low.length > 0 && ` ${joinList(low).replace(/^./, (c) => c.toUpperCase())} ${low.length === 1 ? 'resta' : 'restano'} sotto: con più minuti o un allenamento in più ci arrivi.`}
      </p>
    </section>
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
        const weight = findWeight(equipment, p.weightId);
        return (
          <button type="button" class="ex-row" key={p.exerciseId} onClick={() => onOpen({ exerciseId: p.exerciseId, prescription: p })}>
            <span class="icon">
              {p.bandId ? <BandTag equipment={equipment} bandId={p.bandId} /> : weight ? <WeightTag kg={weight.kg} /> : zone ? <PlatformIcon handles={zone} /> : null}
            </span>
            <div>
              {ex.name}
              {p.focus && <span class="focus-pill">focus</span>}
              <div class="dose">
                {describeDose(p)}, recupero {p.restSec} secondi
                {gearText(p, equipment)}
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

export function PlanView({
  plan,
  schedule,
  equipment,
  focus,
  fresh,
  onHome,
  onEdit,
  onRegenerate,
}: {
  plan: Plan;
  schedule: Schedule;
  equipment: Equipment;
  focus: Muscle[];
  fresh: boolean;
  onHome: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
}) {
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
      <VolumeCard plan={plan} schedule={schedule} focus={focus} />
      {plan.sessions.map((s) => (
        <SessionCard key={s.id} session={s} equipment={equipment} onOpen={setOpen} />
      ))}
      <div class="card note" style={{ padding: 14 }}>
        <b style={{ color: 'var(--text)' }}>Come cresce il piano.</b> A fine allenamento ti chiediamo com'è andata. Se è stato facile aggiungiamo ripetizioni e poi passiamo a un elastico più forte o a un peso più pesante; se è stato duro alleggeriamo.
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
