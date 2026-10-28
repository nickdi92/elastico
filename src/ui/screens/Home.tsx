import { estimateKcal } from '../../domain/calories';
import { nextSessionIndex, weekCount, weekday } from '../../domain/schedule';
import { buildTimeline, totalDuration } from '../../domain/timeline';
import type { Equipment, Plan, Profile, Schedule, WorkoutRecord } from '../../domain/types';
import { NeededList } from '../components/Equipment';
import { WatchRow } from '../components/HeartRate';
import { formatDate } from '../labels';

const DAY_MS = 86_400_000;

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function Home({ plan, schedule, equipment, profile, history, onStart, onPlan }: { plan: Plan; schedule: Schedule; equipment: Equipment; profile: Profile; history: WorkoutRecord[]; onStart: (index: number) => void; onPlan: () => void }) {
  const now = new Date();
  const index = nextSessionIndex(plan, history);
  const session = plan.sessions[index];
  const steps = buildTimeline(session);
  const minutes = Math.round(totalDuration(steps) / 60);
  const kcal = Math.round(estimateKcal(steps, profile.weightKg) / 10) * 10;
  const done = weekCount(history, now);
  const doneToday = history.some((r) => sameDay(new Date(r.startedAt), now));
  const plannedToday = schedule.days.includes(weekday(now));
  const week = Math.floor((now.getTime() - new Date(plan.createdAt).getTime()) / (7 * DAY_MS)) + 1;

  const title = doneToday ? 'Fatto per oggi' : plannedToday ? 'Oggi' : 'Giorno libero';
  const lead = doneToday ? 'Bel lavoro. Il prossimo allenamento è questo.' : plannedToday ? null : 'Oggi non era in programma, ma se hai voglia il prossimo allenamento è pronto.';

  return (
    <main class="screen">
      <div>
        <div class="date">{formatDate(now)}</div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          {title}
        </h1>
        {lead && (
          <p class="lead" style={{ marginTop: 6 }}>
            {lead}
          </p>
        )}
      </div>

      <section class="card">
        <div class="eyebrow">
          Allenamento {session.letter}, settimana {Math.min(week, plan.weeks)} di {plan.weeks}
        </div>
        <h2 class="title-l" style={{ marginTop: 3 }}>
          {session.title}
        </h2>
        <div class="kpi">
          <div>
            <b>{minutes} min</b>durata
          </div>
          <div>
            <b>{session.main.length}</b>esercizi
          </div>
          <div>
            <b>~{kcal}</b>kcal
          </div>
        </div>
        <div class="week">
          <div class="t">
            <b>Questa settimana</b>
            {done} di {schedule.sessionsPerWeek} fatti
          </div>
          <div class="bars">
            {Array.from({ length: schedule.sessionsPerWeek }, (_, i) => (
              <i key={i} class={i < done ? 'done' : ''} />
            ))}
          </div>
        </div>
      </section>

      <button type="button" class="btn" onClick={() => onStart(index)}>
        <span class="play" />
        Inizia allenamento
      </button>

      {week > plan.weeks && (
        <button type="button" class="card note" style={{ textAlign: 'left' }} onClick={onPlan}>
          <b style={{ color: 'var(--text)' }}>Hai finito le {plan.weeks} settimane del piano.</b> Rigeneralo dalla sezione Piano: cambierà alcuni esercizi e terrà ripetizioni ed elastici dove sei arrivato.
        </button>
      )}

      <div class="group-label">Ti servono</div>
      <NeededList session={session} equipment={equipment} />

      <div class="group-label">Battito</div>
      <WatchRow />
    </main>
  );
}
