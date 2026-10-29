import { useEffect, useState } from 'preact/hooks';
import { COLORS } from '../../domain/colors';
import { getExercise } from '../../domain/exercises';
import { guideFor } from '../../domain/guides';
import { findWeight, formatKg } from '../../domain/loads';
import { describeDose } from '../../domain/timeline';
import type { Equipment, Prescription } from '../../domain/types';
import { ILLUSTRATIONS, illustrationSvg } from '../illustrations';
import { resistanceLabel } from '../labels';
import { WeightTag } from './Equipment';
import { BandLoop, IconClose, PlatformIcon } from './icons';

const FRAME_MS = 1400;

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Foto (o disegno) che alterna posizione iniziale e finale. */
function ExerciseMedia({ exerciseId, bandHex }: { exerciseId: string; bandHex: string }) {
  const guide = guideFor(exerciseId);
  const name = getExercise(exerciseId).name;
  const count = guide.photo ? 2 : ILLUSTRATIONS[exerciseId].length;
  const labels = count === 2 ? ['Inizio', 'Fine'] : Array.from({ length: count }, (_, i) => `Fase ${i + 1}`);
  const [frame, setFrame] = useState(0);
  const [auto, setAuto] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % count), FRAME_MS);
    return () => clearInterval(id);
  }, [auto, count]);

  return (
    <div class="ex-media">
      {labels.map((label, i) =>
        guide.photo ? (
          <img key={i} class={i === frame ? 'on' : ''} src={`./exercises/${guide.photo}-${i}.jpg`} alt={`${name}: ${label.toLowerCase()}`} />
        ) : (
          <div key={i} class={`ex-ill${i === frame ? ' on' : ''}`} role="img" aria-label={`${name}: ${label.toLowerCase()}`} dangerouslySetInnerHTML={{ __html: illustrationSvg(exerciseId, i, bandHex) }} />
        ),
      )}
      <div class="ex-frames" role="group" aria-label="Posizione">
        {labels.map((label, i) => (
          <button
            type="button"
            key={label}
            aria-pressed={i === frame}
            onClick={() => {
              setAuto(false);
              setFrame(i);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface ExerciseSheetTarget {
  exerciseId: string;
  prescription?: Prescription;
}

export function ExerciseSheet({ exerciseId, prescription, equipment, onClose }: ExerciseSheetTarget & { equipment: Equipment; onClose: () => void }) {
  const ex = getExercise(exerciseId);
  const guide = guideFor(exerciseId);
  const band = prescription?.bandId ? equipment.bands.find((b) => b.id === prescription.bandId) : undefined;
  const weight = findWeight(equipment, prescription?.weightId);
  const zone = ex.platformZone && equipment.platform ? equipment.platform.zoneColors[ex.platformZone] : undefined;
  const easyDose = ex.unilateral ? '30 secondi per lato' : '40 secondi';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet ex-sheet" role="dialog" aria-modal="true" aria-labelledby="ex-title">
        <button type="button" class="ex-close" aria-label="Chiudi" onClick={onClose}>
          <IconClose />
        </button>
        <ExerciseMedia exerciseId={exerciseId} bandHex={band ? COLORS[band.color].hex : '#6B48A8'} />
        {guide.photoNote && <p class="ex-note">{guide.photoNote}</p>}
        <div>
          <h2 id="ex-title">{ex.name}</h2>
          <p class="ex-muscles">Lavora: {guide.muscles.toLowerCase()}</p>
        </div>

        <div class="card ex-dose">
          <div>{prescription ? `${describeDose(prescription)}, recupero ${prescription.restSec} secondi` : easyDose}</div>
          {band && (
            <div>
              <BandLoop color={COLORS[band.color].hex} />
              Elastico {COLORS[band.color].name.toLowerCase()}, {resistanceLabel(band.kg)}
            </div>
          )}
          {weight && (
            <div>
              <WeightTag kg={weight.kg} />
              {weight.name}, {formatKg(weight.kg)}
            </div>
          )}
          {zone && (
            <div>
              <PlatformIcon handles={zone} />
              Maniglie sul {COLORS[zone].name.toLowerCase()}, zona {ex.platformZone}
            </div>
          )}
        </div>

        <ol class="ex-steps">
          {guide.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p class="ex-tip">
          <b>Occhio.</b> {guide.tip}
        </p>
        {!ex.timed && <p class="ex-rhythm">Ritmo: {ex.cadence.charAt(0).toLowerCase() + ex.cadence.slice(1)}.</p>}
        <button type="button" class="btn" onClick={onClose}>
          Ho capito
        </button>
      </div>
    </div>
  );
}
