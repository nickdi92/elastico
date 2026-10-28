import { useState } from 'preact/hooks';
import type { WorkoutRecord } from '../../domain/types';
import { Sheet } from '../components/controls';
import { formatClock } from '../labels';
import { HrChart } from './Summary';

const FEEDBACK_TEXT = { facile: 'facile', giusta: 'giusta', dura: 'dura' } as const;

function when(r: WorkoutRecord): string {
  const d = new Date(r.startedAt);
  const day = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}, alle ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Dettaglio di un allenamento, con modifica ed eliminazione. */
function RecordSheet({ record, onEdit, onDelete, onClose }: { record: WorkoutRecord; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const samples = record.hrSamples ?? [];
  if (confirm) {
    return (
      <Sheet title="Eliminare l'allenamento?" text={`${record.title}, ${when(record).toLowerCase()}. Non si può annullare. Il piano resta com'è.`} onClose={onClose}>
        <button type="button" class="btn danger" onClick={onDelete}>
          Elimina
        </button>
        <button type="button" class="btn secondary" onClick={() => setConfirm(false)}>
          Annulla
        </button>
      </Sheet>
    );
  }
  return (
    <Sheet title={record.title} text={when(record)} onClose={onClose}>
      <div class="stat-grid">
        <div>
          <b>{formatClock(record.durationSec)}</b>durata
        </div>
        <div>
          <b>{record.kcal}</b>kcal {record.kcalSource === 'battito' ? 'dal battito' : 'stimate'}
        </div>
        <div>
          <b>{record.avgHr ?? '–'}</b>battito medio
        </div>
        <div>
          <b>
            {record.setsDone}/{record.setsTotal}
          </b>
          serie fatte
        </div>
      </div>
      {samples.length > 1 && (
        <div class="hr-card">
          <div class="eyebrow" style={{ marginBottom: 4, fontSize: 12.5, color: 'var(--muted)' }}>
            Battito, massimo {record.maxHr} bpm
          </div>
          <HrChart samples={samples} />
        </div>
      )}
      <p style={{ margin: 0 }}>{record.feedback ? `Com'è andata: ${FEEDBACK_TEXT[record.feedback]}.` : "Com'è andata: non indicato."}</p>
      <button type="button" class="btn secondary" onClick={onEdit}>
        Modifica
      </button>
      <button type="button" class="btn danger" onClick={() => setConfirm(true)}>
        Elimina
      </button>
    </Sheet>
  );
}

export function History({ history, onAdd, onEdit, onDelete }: { history: WorkoutRecord[]; onAdd: () => void; onEdit: (r: WorkoutRecord) => void; onDelete: (id: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = history.find((r) => r.id === openId);
  const items = [...history].reverse();
  const totalMin = Math.round(history.reduce((s, r) => s + r.durationSec, 0) / 60);
  const totalKcal = history.reduce((s, r) => s + r.kcal, 0);
  return (
    <main class="screen">
      <div>
        <div class="date">{history.length === 1 ? '1 allenamento' : `${history.length} allenamenti`}</div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          Storico
        </h1>
      </div>
      {history.length === 0 ? (
        <>
          <p class="lead">Ancora nessun allenamento. Il primo parte dalla home con un tocco, oppure aggiungi qui uno che hai fatto senza l'app.</p>
          <div class="list">
            <button type="button" class="row link" onClick={onAdd}>
              Aggiungi un allenamento
            </button>
          </div>
        </>
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
            <button type="button" class="row link" onClick={onAdd}>
              Aggiungi un allenamento
            </button>
          </div>
          <div class="list">
            {items.map((r) => (
              <button type="button" class="row" key={r.id} style={{ alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10 }} onClick={() => setOpenId(r.id)}>
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
                <span class="chev" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {open && (
        <RecordSheet
          key={open.id}
          record={open}
          onClose={() => setOpenId(null)}
          onEdit={() => onEdit(open)}
          onDelete={() => {
            setOpenId(null);
            onDelete(open.id);
          }}
        />
      )}
    </main>
  );
}
