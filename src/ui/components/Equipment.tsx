import { COLORS, bandColor } from '../../domain/colors';
import { getExercise } from '../../domain/exercises';
import { formatKg } from '../../domain/loads';
import type { Equipment, Gear, SessionTemplate } from '../../domain/types';
import { GEAR_OPTIONS, resistanceLabel } from '../labels';
import { BandLoop, PlatformIcon } from './icons';

/** Il peso scritto in grande, come le cifre del resto dell'app. `outline` per gli sfondi colorati dell'allenamento. */
export function WeightTag({ kg, size = 30, outline }: { kg: number; size?: number; outline?: boolean }) {
  const text = kg.toLocaleString('it-IT', { maximumFractionDigits: 1 });
  return (
    <span class={`wtag${outline ? ' outline' : ''}`} style={{ width: size, height: size, fontSize: (size * (text.length > 2 ? 0.42 : 0.56)).toFixed(1) + 'px' }} aria-hidden="true">
      <b>{text}</b>
      <small>kg</small>
    </span>
  );
}

/** Cosa serve per una sessione: elastici (dal più leggero), pesi, piattaforma, altri attrezzi. */
export function NeededList({ session, equipment }: { session: SessionTemplate; equipment: Equipment }) {
  const bandIds = new Set(session.main.map((p) => p.bandId).filter(Boolean));
  const bands = equipment.bands.filter((b) => bandIds.has(b.id)).sort((a, b) => a.kg - b.kg);
  const weightIds = new Set(session.main.map((p) => p.weightId).filter(Boolean));
  const weights = equipment.weights.filter((w) => weightIds.has(w.id)).sort((a, b) => a.kg - b.kg);
  const exercises = session.main.map((p) => getExercise(p.exerciseId));
  const platformZones = [...new Set(exercises.map((e) => e.platformZone).filter(Boolean))];
  const gear = new Set<Gear>();
  for (const e of exercises) for (const r of e.requires) if (r !== 'band' && r !== 'platform') gear.add(r);

  return (
    <div class="list">
      {bands.map((b, i) => (
        <div class="row" key={b.id}>
          <BandLoop color={COLORS[b.color].hex} tilt={i % 2 ? 10 : -12} />
          Elastico {COLORS[b.color].name.toLowerCase()}
          <span class="r">{resistanceLabel(b.kg)}</span>
        </div>
      ))}
      {weights.map((w) => (
        <div class="row" key={w.id}>
          <WeightTag kg={w.kg} />
          {w.name}
          <span class="r">{formatKg(w.kg)}</span>
        </div>
      ))}
      {platformZones.length > 0 && equipment.platform && (
        <div class="row">
          <PlatformIcon handles={equipment.platform.zoneColors[platformZones[0]!]} />
          Piattaforma push-up
          <span class="r">{platformZones.join(', ')}</span>
        </div>
      )}
      {GEAR_OPTIONS.filter(([g]) => gear.has(g)).map(([g, label]) => (
        <div class="row" key={g}>
          <span style={{ width: 30 }} />
          {label}
        </div>
      ))}
      {bands.length === 0 && weights.length === 0 && platformZones.length === 0 && gear.size === 0 && (
        <div class="row">
          <span style={{ width: 30 }} />
          Solo il tuo corpo
        </div>
      )}
    </div>
  );
}

export function BandTag({ equipment, bandId, size = 26, stroke }: { equipment: Equipment; bandId?: string; size?: number; stroke?: number }) {
  const c = bandColor(equipment, bandId);
  if (!c) return null;
  return <BandLoop color={COLORS[c].hex} size={size} stroke={stroke} />;
}
