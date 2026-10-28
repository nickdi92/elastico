import type { WorkoutRecord } from '../../domain/types';

const FEEDBACK_TEXT = { facile: 'facile', giusta: 'giusta', dura: 'dura' } as const;

export function History({ history }: { history: WorkoutRecord[] }) {
  const items = [...history].reverse();
  const totalMin = Math.round(history.reduce((s, r) => s + r.durationSec, 0) / 60);
  const totalKcal = history.reduce((s, r) => s + r.kcal, 0);
  return (
    <main class="screen">
      <div>
        <div class="date">{history.length} allenamenti</div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          Storico
        </h1>
      </div>
      {history.length === 0 ? (
        <p class="lead">Ancora nessun allenamento. Il primo parte dalla home con un tocco.</p>
      ) : (
        <>
          <section class="card">
            <div class="kpi" style={{ marginTop: 0, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div>
                <b>{totalMin} min</b>in totale
              </div>
              <div>
                <b>{totalKcal}</b>kcal in totale
              </div>
            </div>
          </section>
          <div class="list">
            {items.map((r) => (
              <div class="row" key={r.id} style={{ alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10 }}>
                <div>
                  {r.title}
                  <div class="note" style={{ padding: 0, marginTop: 2 }}>
                    {new Date(r.startedAt).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}, {Math.round(r.durationSec / 60)} min
                    {r.feedback && `, ${FEEDBACK_TEXT[r.feedback]}`}
                  </div>
                </div>
                <span class="r">
                  {r.kcal} kcal
                  {r.avgHr && (
                    <>
                      <br />
                      {r.avgHr} bpm
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
