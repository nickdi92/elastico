import { useState } from 'preact/hooks';
import { COLORS, COLOR_IDS } from '../../domain/colors';
import { suggestDays } from '../../domain/schedule';
import type { Band, ColorId, Equipment, Gear, Limitation, PlatformZone, Profile, Schedule, Sex } from '../../domain/types';
import { Chips, NumberField, Seg, Toggle } from '../components/controls';
import { BandLoop, IconTrash } from '../components/icons';
import {
  DAY_SHORT,
  EXPERIENCE_OPTIONS,
  GEAR_OPTIONS,
  GOAL_OPTIONS,
  LIMITATION_OPTIONS,
  MINUTES_OPTIONS,
  PLACE_OPTIONS,
  RESISTANCES,
  SEX_OPTIONS,
  ZONE_OPTIONS,
} from '../labels';

type DraftProfile = Omit<Profile, 'sex'> & { sex: Sex | '' };

export interface OnboardingInitial {
  profile: Profile | null;
  schedule: Schedule | null;
  equipment: Equipment | null;
}

const DEFAULT_PROFILE: DraftProfile = {
  sex: '',
  age: 35,
  heightCm: 175,
  weightKg: 75,
  experience: 'intermedio',
  goal: 'tonificare',
  limitations: [],
};

const DEFAULT_EQUIPMENT: Equipment = {
  bands: [
    { id: 'b1', color: 'giallo', kg: 5 },
    { id: 'b2', color: 'rosso', kg: 10 },
    { id: 'b3', color: 'viola', kg: 20 },
  ],
  platform: { zoneColors: { petto: 'rosso', spalle: 'blu', tricipiti: 'verde', dorso: 'giallo' } },
  gear: ['tappetino'],
  place: 'dentro',
};

const PLATFORM_COLORS: ColorId[] = ['rosso', 'blu', 'verde', 'giallo', 'arancione', 'viola', 'nero', 'grigio'];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function inRange(v: number, min: number, max: number) {
  return Number.isFinite(v) && v >= min && v <= max;
}

function structureText(n: number): string {
  if (n <= 3) return 'Ogni volta lavori tutto il corpo.';
  if (n === 4) return 'Due allenamenti alternati: gambe e tirata, poi spinta, spalle e core.';
  return 'Tre allenamenti a rotazione: gambe, spinta, tirata.';
}

function Header({ step, title, lead }: { step: number; title: string; lead?: string }) {
  return (
    <>
      <div class="steps" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} class={i <= step ? 'on' : ''} />
        ))}
      </div>
      <div>
        <div class="date">Passo {step} di 3</div>
        <h1 class="title-xl" style={{ marginTop: 4 }}>
          {title}
        </h1>
        {lead && (
          <p class="lead" style={{ marginTop: 6 }}>
            {lead}
          </p>
        )}
      </div>
    </>
  );
}

export function Onboarding({ initial, onComplete, onCancel }: { initial: OnboardingInitial; onComplete: (p: Profile, s: Schedule, e: Equipment) => void; onCancel?: () => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<DraftProfile>(initial.profile ?? DEFAULT_PROFILE);
  const [schedule, setSchedule] = useState<Schedule>(initial.schedule ?? { sessionsPerWeek: 3, minutes: 30, days: suggestDays(3) });
  const [equipment, setEquipment] = useState<Equipment>(initial.equipment ?? DEFAULT_EQUIPMENT);
  const [adding, setAdding] = useState(false);

  const go = (n: number) => {
    setStep(n);
    window.scrollTo(0, 0);
  };

  if (step === 1) {
    const p = profile;
    const valid = p.sex !== '' && inRange(p.age, 14, 90) && inRange(p.heightCm, 120, 220) && inRange(p.weightKg, 35, 200);
    const set = (patch: Partial<DraftProfile>) => setProfile({ ...p, ...patch });
    return (
      <main class="screen no-tabs">
        <Header step={1} title="Parliamo di te" lead="Servono per calibrare carichi, volume e calorie." />
        <div class="field">
          <span class="label">Sesso</span>
          <Seg label="Sesso" options={SEX_OPTIONS} value={p.sex as Sex} onChange={(sex) => set({ sex })} />
        </div>
        <div class="nums3">
          <NumberField label="Età" value={p.age} min={14} max={90} onChange={(age) => set({ age })} />
          <NumberField label="Altezza" unit="cm" value={p.heightCm} min={120} max={220} onChange={(heightCm) => set({ heightCm })} />
          <NumberField label="Peso" unit="kg" value={p.weightKg} min={35} max={200} onChange={(weightKg) => set({ weightKg })} />
        </div>
        <div class="field">
          <span class="label">Quanto ti alleni oggi?</span>
          <Seg label="Esperienza" options={EXPERIENCE_OPTIONS} value={p.experience} onChange={(experience) => set({ experience })} />
        </div>
        <div class="field">
          <span class="label">Obiettivo principale</span>
          <Chips label="Obiettivo" options={GOAL_OPTIONS} selected={[p.goal]} onToggle={(goal) => set({ goal })} />
        </div>
        <div class="field">
          <span class="label">Dolori o limitazioni</span>
          <Chips<Limitation> label="Limitazioni" options={LIMITATION_OPTIONS} selected={p.limitations} onToggle={(l) => set({ limitations: toggle(p.limitations, l) })} />
          <span class="hint">Togliamo gli esercizi che caricano queste zone. Con un dolore acuto o recente, senti prima un medico.</span>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" class="btn" disabled={!valid} onClick={() => go(2)}>
            Avanti
          </button>
          {onCancel && (
            <button type="button" class="link" onClick={onCancel}>
              Annulla
            </button>
          )}
        </div>
      </main>
    );
  }

  if (step === 2) {
    const s = schedule;
    const n = s.sessionsPerWeek;
    const hours = (n * s.minutes) / 60;
    const hoursText = hours < 1 ? `${n * s.minutes} minuti` : `${hours.toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${hours === 1 ? 'ora' : 'ore'}`;
    return (
      <main class="screen no-tabs">
        <Header step={2} title="Quanto tempo hai?" lead="Meglio poco e costante che tanto ogni tanto." />
        <div class="field">
          <span class="label">Allenamenti a settimana</span>
          <div class="big-nums" role="group" aria-label="Allenamenti a settimana">
            {[2, 3, 4, 5, 6].map((v) => (
              <button type="button" key={v} aria-pressed={v === n} onClick={() => setSchedule({ ...s, sessionsPerWeek: v, days: suggestDays(v) })}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div class="field">
          <span class="label">Durata di ogni allenamento</span>
          <Seg
            label="Minuti"
            options={MINUTES_OPTIONS.map((m) => [String(m), `${m} min`] as [string, string])}
            value={String(s.minutes)}
            onChange={(m) => setSchedule({ ...s, minutes: Number(m) })}
          />
        </div>
        <div class="field">
          <span class="label">Giorni preferiti</span>
          <div class="days" role="group" aria-label="Giorni preferiti">
            {DAY_SHORT.map((d, i) => (
              <button type="button" key={i} aria-pressed={s.days.includes(i)} onClick={() => setSchedule({ ...s, days: toggle(s.days, i).sort() })}>
                {d}
              </button>
            ))}
          </div>
          <span class="hint">
            Scegline {n}. {s.days.length !== n && `Ora ne hai scelti ${s.days.length}.`}
          </span>
        </div>
        <div class="card note" style={{ padding: 14 }}>
          <b style={{ color: 'var(--text)' }}>Circa {hoursText} a settimana.</b> {structureText(n)}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" class="btn" disabled={s.days.length !== n} onClick={() => go(3)}>
            Avanti
          </button>
          <button type="button" class="link" onClick={() => go(1)}>
            Indietro
          </button>
        </div>
      </main>
    );
  }

  const e = equipment;
  const setE = (patch: Partial<Equipment>) => setEquipment({ ...e, ...patch });
  const updateBand = (id: string, patch: Partial<Band>) => setE({ bands: e.bands.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  const addBand = (color: ColorId) => {
    setE({ bands: [...e.bands, { id: `b${Date.now()}`, color, kg: 10 }] });
    setAdding(false);
  };
  const setZone = (zone: PlatformZone, color: ColorId) =>
    e.platform && setE({ platform: { zoneColors: { ...e.platform.zoneColors, [zone]: color } } });

  return (
    <main class="screen no-tabs">
      <Header step={3} title="Cosa hai con te?" />
      <div class="field">
        <span class="label">Elastici</span>
        <div class="list">
          {e.bands.map((b) => (
            <div class="band-row" key={b.id}>
              <BandLoop color={COLORS[b.color].hex} />
              {COLORS[b.color].name}
              <select aria-label={`Resistenza elastico ${COLORS[b.color].name}`} value={b.kg} onChange={(ev) => updateBand(b.id, { kg: Number((ev.target as HTMLSelectElement).value) })}>
                {RESISTANCES.map((r) => (
                  <option key={r.kg} value={r.kg}>
                    {r.label} (~{r.kg} kg)
                  </option>
                ))}
              </select>
              <button type="button" class="del" aria-label={`Togli elastico ${COLORS[b.color].name}`} onClick={() => setE({ bands: e.bands.filter((x) => x.id !== b.id) })}>
                <IconTrash />
              </button>
            </div>
          ))}
          {adding ? (
            <div class="swatches" role="group" aria-label="Colore del nuovo elastico">
              {COLOR_IDS.map((c) => (
                <button type="button" key={c} class="swatch" style={{ background: COLORS[c].hex }} aria-label={COLORS[c].name} onClick={() => addBand(c)} />
              ))}
            </div>
          ) : (
            <button type="button" class="row link" onClick={() => setAdding(true)}>
              Aggiungi elastico
            </button>
          )}
        </div>
        <span class="hint">I colori cambiano da marca a marca: scegli la resistenza scritta sull'etichetta.</span>
      </div>

      <div class="field">
        <div class="list">
          <Toggle
            label="Piattaforma per push-up"
            checked={e.platform !== null}
            onChange={(on) => setE({ platform: on ? (initial.equipment?.platform ?? DEFAULT_EQUIPMENT.platform) : null })}
          />
          {e.platform &&
            ZONE_OPTIONS.map(([zone, label]) => (
              <div class="zone-row" key={zone}>
                <i style={{ background: COLORS[e.platform!.zoneColors[zone]].hex }} />
                {label}
                <select aria-label={`Colore zona ${label}`} value={e.platform!.zoneColors[zone]} onChange={(ev) => setZone(zone, (ev.target as HTMLSelectElement).value as ColorId)}>
                  {PLATFORM_COLORS.map((c) => (
                    <option key={c} value={c}>
                      {COLORS[c].name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
        {e.platform && <span class="hint">Abbina ogni colore delle fessure al muscolo scritto sulla piattaforma.</span>}
      </div>

      <div class="field">
        <span class="label">Altro</span>
        <Chips<Gear> label="Altri attrezzi" options={GEAR_OPTIONS} selected={e.gear} onToggle={(g) => setE({ gear: toggle(e.gear, g) })} />
      </div>

      <div class="field">
        <span class="label">Dove ti alleni</span>
        <Seg label="Luogo" options={PLACE_OPTIONS} value={e.place} onChange={(place) => setE({ place })} />
        <span class="hint">{e.place === 'dentro' ? 'Dentro: niente salti né esercizi che chiedono metri liberi.' : 'Fuori puoi fare anche salti e affondi in camminata.'}</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" class="btn" onClick={() => onComplete(profile as Profile, schedule, equipment)}>
          Crea il mio piano
        </button>
        <button type="button" class="link" onClick={() => go(2)}>
          Indietro
        </button>
      </div>
    </main>
  );
}
