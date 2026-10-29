import { useState } from 'preact/hooks';
import type { Weight, WeightUse } from '../../domain/types';
import { WEIGHT_KINDS, WEIGHT_USE_HINTS, WEIGHT_USE_OPTIONS } from '../labels';
import { Seg, Sheet } from './controls';

const OTHER = 'altro';
const MIN_KG = 0.5;
const MAX_KG = 100;

/** Passi più fini sui pesi leggeri: 0,5 kg fino a 5, poi 1 kg, poi 2 sopra i 30. */
function nextKg(kg: number, dir: 1 | -1): number {
  if (!Number.isFinite(kg)) return 5;
  const step = (dir === 1 ? kg < 5 : kg <= 5) ? 0.5 : (dir === 1 ? kg < 30 : kg <= 30) ? 1 : 2;
  return Math.min(MAX_KG, Math.max(MIN_KG, Math.round((kg + dir * step) * 2) / 2));
}

function kindOf(w: Weight | undefined): string {
  if (!w) return WEIGHT_KINDS[0].key;
  return WEIGHT_KINDS.find((k) => k.name === w.name && k.use === w.use)?.key ?? OTHER;
}

/** Aggiunge o modifica un peso: uno di quelli già pronti, oppure qualsiasi cosa con il suo nome. */
export function WeightSheet({ initial, onSave, onDelete, onClose }: { initial?: Weight; onSave: (w: Weight) => void; onDelete?: () => void; onClose: () => void }) {
  const [kind, setKind] = useState(() => kindOf(initial));
  const [name, setName] = useState(initial && kindOf(initial) === OTHER ? initial.name : '');
  const [use, setUse] = useState<WeightUse>(initial?.use ?? 'peso');
  const [kg, setKg] = useState(initial?.kg ?? 5);

  const preset = WEIGHT_KINDS.find((k) => k.key === kind);
  const valid = (preset !== undefined || name.trim().length > 0) && kg >= MIN_KG && kg <= MAX_KG;
  const save = () =>
    onSave({
      id: initial?.id ?? `w${Date.now()}`,
      name: preset ? preset.name : name.trim(),
      use: preset ? preset.use : use,
      kg,
    });

  return (
    <Sheet title={initial ? 'Modifica il peso' : 'Aggiungi un peso'} onClose={onClose}>
      <div class="field">
        <span class="label">Cos'è</span>
        <div class="kind-grid" role="group" aria-label="Tipo di peso">
          {[...WEIGHT_KINDS, { key: OTHER, name: 'Altro' }].map((k) => (
            <button type="button" key={k.key} aria-pressed={k.key === kind} onClick={() => setKind(k.key)}>
              {k.name}
            </button>
          ))}
        </div>
      </div>

      {!preset && (
        <>
          <label class="field">
            <span class="label">Nome</span>
            <input
              class="text-input"
              type="text"
              maxLength={30}
              placeholder="Zaino con libri, tanica d'acqua…"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
            />
          </label>
          <div class="field">
            <span class="label">Come lo tieni?</span>
            <Seg label="Come lo tieni" options={WEIGHT_USE_OPTIONS} value={use} onChange={setUse} />
            <span class="hint">{WEIGHT_USE_HINTS[use]}</span>
          </div>
        </>
      )}

      <div class="field">
        <span class="label">{kind === 'manubri' ? 'Quanto pesa ognuno' : 'Quanto pesa'}</span>
        <div class="stepper">
          <button type="button" aria-label="Meno" disabled={kg <= MIN_KG} onClick={() => setKg(nextKg(kg, -1))}>
            −
          </button>
          <label>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min={MIN_KG}
              max={MAX_KG}
              aria-label="Chili"
              value={Number.isFinite(kg) ? kg : ''}
              onInput={(e) => setKg(parseFloat((e.target as HTMLInputElement).value.replace(',', '.')))}
            />
            <small>kg</small>
          </label>
          <button type="button" aria-label="Più" disabled={kg >= MAX_KG} onClick={() => setKg(nextKg(kg, 1))}>
            +
          </button>
        </div>
        {!preset && <span class="hint">Non sai quanto pesa? Pesati sulla bilancia di casa con e senza in mano, e fai la differenza.</span>}
      </div>

      <button type="button" class="btn" disabled={!valid} onClick={save}>
        {initial ? 'Salva' : 'Aggiungi'}
      </button>
      {onDelete && (
        <button type="button" class="btn danger" onClick={onDelete}>
          Togli questo peso
        </button>
      )}
    </Sheet>
  );
}
