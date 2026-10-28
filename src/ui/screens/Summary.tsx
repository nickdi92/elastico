import { useState } from 'preact/hooks';
import type { Feedback, WorkoutRecord } from '../../domain/types';
import { Seg } from '../components/controls';
import { IconCheck } from '../components/icons';
import { formatClock } from '../labels';

const FEEDBACK: [Feedback, string][] = [
  ['facile', 'Troppo facile'],
  ['giusta', 'Giusta'],
  ['dura', 'Troppo dura'],
];

export function HrChart({ samples }: { samples: number[] }) {
  const min = Math.min(...samples) - 5;
  const max = Math.max(...samples) + 5;
  const w = 250;
  const h = 64;
  const pts = samples.map((v, i) => `${((i / Math.max(1, samples.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min)) * h).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label={`Battito da ${Math.min(...samples)} a ${Math.max(...samples)} bpm`}>
      <defs>
        <linearGradient id="hrfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FF3B30" stop-opacity=".22" />
          <stop offset="1" stop-color="#FF3B30" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#hrfill)" points={`0,${h} ${pts.join(' ')} ${w},${h}`} />
      <polyline fill="none" stroke="#FF3B30" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" points={pts.join(' ')} />
    </svg>
  );
}

export function Summary({ record, onSave }: { record: WorkoutRecord; onSave: (r: WorkoutRecord) => void }) {
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const samples = record.hrSamples ?? [];
  return (
    <main class="screen no-tabs">
      <div class="done-badge" style={{ marginTop: 8 }}>
        <IconCheck />
      </div>
      <div>
        <h1 class="title-xl">Fatto</h1>
        <p class="lead" style={{ marginTop: 4 }}>
          Allenamento: {record.title.toLowerCase()}
        </p>
      </div>
      <section class="card" style={{ padding: '10px 14px' }}>
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
      </section>
      {samples.length > 1 && (
        <section class="card" style={{ padding: '10px 14px' }}>
          <div class="eyebrow" style={{ marginBottom: 4 }}>
            Battito durante l'allenamento, massimo {record.maxHr} bpm
          </div>
          <HrChart samples={samples} />
        </section>
      )}
      {record.kcalSource === 'stima' && <p class="note">Calorie stimate da peso, durata e tipo di esercizio: considerale un ordine di grandezza.</p>}
      <div class="group-label">Com'è andata?</div>
      <Seg label="Com'è andata" options={FEEDBACK} value={feedback as Feedback} onChange={setFeedback} />
      <p class="note">La prossima volta questo allenamento si adatta alla tua risposta.</p>
      <button type="button" class="btn" style={{ marginTop: 'auto' }} onClick={() => onSave({ ...record, feedback })}>
        Salva
      </button>
    </main>
  );
}
