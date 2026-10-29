import { useState } from 'preact/hooks';
import type { Profile } from '../../domain/types';
import type { Settings as SettingsData } from '../../services/storage';
import { Sheet, Toggle } from '../components/controls';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS, LIMITATION_OPTIONS, SEX_OPTIONS, joinList, muscleName } from '../labels';

const label = <T extends string>(options: [T, string][], v: T) => options.find(([k]) => k === v)?.[1] ?? v;

export function Settings({ profile, settings, onSettings, onEdit, onReset }: { profile: Profile; settings: SettingsData; onSettings: (s: SettingsData) => void; onEdit: () => void; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const limits = profile.limitations.map((l) => label(LIMITATION_OPTIONS, l).toLowerCase()).join(', ') || 'nessuna';
  return (
    <main class="screen">
      <h1 class="title-xl">Profilo</h1>
      <div class="list">
        <div class="row">
          {label(SEX_OPTIONS, profile.sex)}, {profile.age} anni
          <span class="r">
            {profile.heightCm} cm, {profile.weightKg} kg
          </span>
        </div>
        <div class="row">
          Obiettivo<span class="r">{label(GOAL_OPTIONS, profile.goal)}</span>
        </div>
        {profile.focus.length > 0 && (
          <div class="row">
            Far crescere<span class="r">{joinList(profile.focus.map((m) => muscleName(m).toLowerCase()))}</span>
          </div>
        )}
        <div class="row">
          Ti alleni<span class="r">{label(EXPERIENCE_OPTIONS, profile.experience).toLowerCase()}</span>
        </div>
        <div class="row">
          Limitazioni<span class="r">{limits}</span>
        </div>
        <button type="button" class="row link" onClick={onEdit}>
          Modifica i miei dati
        </button>
      </div>

      <div class="group-label">Durante l'allenamento</div>
      <div class="list">
        <Toggle label="Voce guida" checked={settings.voice} onChange={(voice) => onSettings({ ...settings, voice })} />
        <Toggle label="Suoni e conto alla rovescia" checked={settings.sounds} onChange={(sounds) => onSettings({ ...settings, sounds })} />
        <Toggle label="Tic a ogni ripetizione" checked={settings.repTicks} onChange={(repTicks) => onSettings({ ...settings, repTicks })} />
      </div>

      <div class="group-label">Dati</div>
      <div class="list">
        <button type="button" class="row" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(true)}>
          Cancella tutti i dati
        </button>
      </div>
      <p class="note">I dati restano solo su questo telefono. Non vengono inviati a nessun server.</p>
      <p class="note">Foto degli esercizi: free-exercise-db, pubblico dominio. Gli esercizi senza foto adatta sono disegnati.</p>
      <p class="disclaimer">
        Elastico propone piani indicativi basati su regole generali di allenamento. Non sostituisce un personal trainer né il parere del medico.
      </p>

      {confirm && (
        <Sheet title="Cancellare tutto?" text="Profilo, piano e storico verranno eliminati da questo telefono. Non si può annullare." onClose={() => setConfirm(false)}>
          <button type="button" class="btn danger" onClick={onReset}>
            Cancella tutti i dati
          </button>
          <button type="button" class="btn secondary" onClick={() => setConfirm(false)}>
            Annulla
          </button>
        </Sheet>
      )}
    </main>
  );
}
