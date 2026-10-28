import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { announcement, isGetReady } from '../../domain/announce';
import { kcalPerSecond } from '../../domain/calories';
import { COLORS, bandColor, stepTheme } from '../../domain/colors';
import { getExercise } from '../../domain/exercises';
import {
  type PlayerState,
  addTime,
  back,
  cues,
  currentRep,
  elapsed,
  pause,
  remaining,
  resume,
  skip,
  start,
  tick,
} from '../../domain/player';
import { buildTimeline } from '../../domain/timeline';
import type { Equipment, Profile, SessionTemplate, Step, WorkoutRecord } from '../../domain/types';
import { beep, speak, stopSpeaking } from '../../services/audio';
import type { Settings } from '../../services/storage';
import { allowSleep, keepAwake } from '../../services/wakeLock';
import { Sheet } from '../components/controls';
import { useHr } from '../components/HeartRate';
import { BandLoop, IconClose, IconNext, IconPause, IconPlay, IconPrev, PlatformIcon } from '../components/icons';
import { formatClock } from '../labels';

const TICK_MS = 200;
const HR_SAMPLE_SEC = 5;

interface Props {
  session: SessionTemplate;
  profile: Profile;
  equipment: Equipment;
  settings: Settings;
  onFinish: (r: WorkoutRecord) => void;
  onQuit: () => void;
}

function nameSize(name: string): number {
  if (name.length <= 10) return 54;
  if (name.length <= 18) return 44;
  if (name.length <= 28) return 37;
  return 31;
}

/** Posizione del passo dentro riscaldamento o defaticamento, es. "2 di 4". */
function phasePosition(steps: Step[], index: number): string {
  const kind = steps[index].kind;
  const same = steps.map((s, i) => (s.kind === kind ? i : -1)).filter((i) => i >= 0);
  return `${same.indexOf(index) + 1} di ${same.length}`;
}

function sideLabel(step: Step, el: number): string {
  return el < step.durationSec / 2 ? 'lato destro' : 'lato sinistro';
}

export function Workout({ session, profile, equipment, settings, onFinish, onQuit }: Props) {
  const steps = useMemo(() => buildTimeline(session), [session]);
  const hr = useHr();
  const bpmRef = useRef(hr.bpm);
  bpmRef.current = hr.bpm;

  const ps = useRef<PlayerState>(start(Date.now()));
  const last = useRef({ t: Date.now(), index: 0, elapsed: 0 });
  const acc = useRef({ kcal: 0, activeSec: 0, hrSec: 0, sampleClock: 0, samples: [] as number[], workDone: new Set<number>() });
  const startedAt = useRef(new Date().toISOString());
  const finished = useRef(false);
  const [, setFrame] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const pausedByExit = useRef(false);

  const say = (text: string) => settings.voice && speak(text);
  const sound = (freq: number, ms: number, vol?: number) => settings.sounds && beep(freq, ms, vol);

  const announce = (index: number) => {
    sound(1046, 200);
    say(announcement(steps, index, equipment));
  };

  const account = (prev: PlayerState, t: number) => {
    const dt = (t - last.current.t) / 1000;
    if (prev.pausedAt !== null || prev.done || dt <= 0) return;
    const a = acc.current;
    const bpm = bpmRef.current;
    a.kcal += kcalPerSecond(steps[prev.index].met, bpm, profile) * dt;
    a.activeSec += dt;
    if (bpm) {
      a.hrSec += dt;
      a.sampleClock += dt;
      while (a.sampleClock >= HR_SAMPLE_SEC) {
        a.sampleClock -= HR_SAMPLE_SEC;
        a.samples.push(bpm);
      }
    }
  };

  const markWork = (from: number, to: number) => {
    for (let i = from; i < to; i++) if (steps[i].kind === 'work') acc.current.workDone.add(i);
  };

  const record = (): WorkoutRecord => {
    const a = acc.current;
    const n = a.samples.length;
    return {
      id: startedAt.current,
      sessionId: session.id,
      title: session.title,
      startedAt: startedAt.current,
      durationSec: Math.round(a.activeSec),
      kcal: Math.round(a.kcal),
      kcalSource: n > 0 && a.hrSec >= a.activeSec * 0.5 ? 'battito' : 'stima',
      avgHr: n ? Math.round(a.samples.reduce((x, y) => x + y, 0) / n) : undefined,
      maxHr: n ? Math.max(...a.samples) : undefined,
      hrSamples: n ? a.samples : undefined,
      setsDone: a.workDone.size,
      setsTotal: steps.filter((s) => s.kind === 'work').length,
    };
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    sound(1318, 400);
    say('Allenamento finito. Ottimo lavoro!');
    onFinish(record());
  };

  const loop = () => {
    const t = Date.now();
    const prev = ps.current;
    account(prev, t);
    const next = tick(prev, steps, t);
    if (next.done) {
      markWork(prev.index, steps.length);
      ps.current = next;
      return finish();
    }
    if (next.index !== prev.index) markWork(prev.index, next.index);
    const moment = { index: next.index, elapsed: elapsed(next, t) };
    for (const cue of cues(steps, last.current, moment)) {
      if (cue === 'phase') announce(next.index);
      if (cue === 'count') sound(880, 110);
      if (cue === 'side') {
        sound(660, 160);
        say('Cambia lato');
      }
      if (cue === 'rep' && settings.repTicks) sound(1500, 30, 0.08);
    }
    ps.current = next;
    last.current = { t, ...moment };
    setFrame((f) => f + 1);
  };

  const act = (fn: (s: PlayerState, t: number) => PlayerState) => {
    const t = Date.now();
    const prev = ps.current;
    account(prev, t);
    const next = fn(prev, t);
    if (next.index !== prev.index && steps[prev.index].kind === 'work' && elapsed(prev, t) >= steps[prev.index].durationSec / 2) {
      acc.current.workDone.add(prev.index);
    }
    ps.current = next;
    last.current = { t, index: next.index, elapsed: elapsed(next, t) };
    if (next.done) return finish();
    const moved = next.index !== prev.index || elapsed(next, t) < elapsed(prev, t) - 0.5;
    if (moved && next.pausedAt === null) announce(next.index);
    setFrame((f) => f + 1);
  };

  useEffect(() => {
    keepAwake();
    announce(0);
    const id = setInterval(loop, TICK_MS);
    return () => {
      clearInterval(id);
      allowSleep();
      stopSpeaking();
    };
  }, []);

  const t = Date.now();
  const s = ps.current;
  const step = steps[s.index];
  const ex = getExercise(step.exerciseId);
  const rem = remaining(s, steps, t);
  const el = elapsed(s, t);
  const progress = Math.min(1, Math.max(0, el / (step.durationSec + s.extra)));
  const theme = stepTheme(step, equipment);
  const paused = s.pausedAt !== null;
  const style = { '--from': theme.from, '--mid': theme.mid, '--to': theme.to, '--fg': theme.text } as JSX.CSSProperties;
  const lightBg = theme.text !== '#FFFFFF';

  const togglePause = () => act((st, now) => (st.pausedAt === null ? pause(st, now) : resume(st, now)));
  const openExit = () => {
    pausedByExit.current = !paused;
    if (!paused) togglePause();
    setExitOpen(true);
  };
  const closeExit = () => {
    setExitOpen(false);
    if (pausedByExit.current) togglePause();
  };

  const center = step.kind === 'warmup' ? 'Riscaldamento' : step.kind === 'cooldown' ? 'Defaticamento' : `${step.exerciseNo} di ${step.exerciseCount}`;
  const right =
    step.kind === 'work'
      ? `Serie ${step.set} di ${step.totalSets}`
      : step.kind === 'rest'
        ? isGetReady(steps, s.index)
          ? 'Preparati'
          : 'Riposo'
        : phasePosition(steps, s.index);

  const stats = (
    <div class="w-stats">
      <div class="glass">
        <span>Battito</span>
        <b>{hr.bpm ?? '–'}</b>
      </div>
      <div class="glass">
        <span>Calorie</span>
        <b>{Math.round(acc.current.kcal)}</b>
      </div>
      <div class="glass">
        <span>Tempo</span>
        <b>{formatClock(acc.current.activeSec)}</b>
      </div>
    </div>
  );

  const controls = (
    <div class="w-ctrl">
      <button type="button" class="glass" aria-label="Indietro" onClick={() => act((st, now) => back(st, now))}>
        <IconPrev />
      </button>
      <button type="button" class="main" aria-label={paused ? 'Riprendi' : 'Pausa'} onClick={togglePause}>
        {paused ? <IconPlay /> : <IconPause />}
      </button>
      <button type="button" class="glass" aria-label="Avanti" onClick={() => act((st, now) => skip(st, steps, now))}>
        <IconNext />
      </button>
    </div>
  );

  let body: JSX.Element;
  if (step.kind === 'rest') {
    const next = step.next!;
    const sameExercise = steps[s.index - 1]?.kind === 'work' && steps[s.index - 1].exerciseId === next.exerciseId;
    const nextBand = bandColor(equipment, next.bandId);
    const nextZone = getExercise(next.exerciseId).platformZone;
    const zoneColor = nextZone && equipment.platform ? equipment.platform.zoneColors[nextZone] : undefined;
    body = (
      <>
        <div class="w-label">{isGetReady(steps, s.index) ? 'Preparati' : 'Riposa'}</div>
        <div class="w-timer" style={{ marginTop: 8 }}>
          {formatClock(rem)}
        </div>
        <div class="w-progress">
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        <div class="w-restbtns">
          <button type="button" class="glass" onClick={() => act((st) => addTime(st, 15))}>
            +15 secondi
          </button>
          <button type="button" class="glass" onClick={() => act((st, now) => skip(st, steps, now))}>
            Salta
          </button>
        </div>
        {paused && <div class="w-paused">In pausa</div>}
        <div class="w-next glass">
          <div class="k">{sameExercise ? `Prossimo: serie ${step.set} di ${step.totalSets}` : `Prossimo, esercizio ${step.exerciseNo} di ${step.exerciseCount}`}</div>
          <div class="nn">
            <span>{next.name}</span>
            {nextBand ? <BandLoop color={COLORS[nextBand].hex} size={34} /> : zoneColor ? <PlatformIcon handles={zoneColor} size={34} board={theme.text} /> : null}
          </div>
          <div class="s">
            {nextBand && `Elastico ${COLORS[nextBand].name.toLowerCase()}, `}
            {zoneColor && `Maniglie sul ${COLORS[zoneColor].name.toLowerCase()}, `}
            {next.detail}
          </div>
          {!sameExercise && <div class="h">{next.setup}</div>}
        </div>
        <div class="w-hr">
          <span>{hr.bpm ? 'Battito in recupero' : 'Calorie finora'}</span>
          <b>{hr.bpm ?? Math.round(acc.current.kcal)}</b>
        </div>
        {controls}
      </>
    );
  } else {
    const band = bandColor(equipment, step.bandId);
    const zone = step.kind === 'work' && ex.platformZone && equipment.platform ? equipment.platform.zoneColors[ex.platformZone] : undefined;
    const rep = currentRep(step, el);
    const side = step.sides === 2 ? `, ${sideLabel(step, el)}` : '';
    const line =
      step.kind === 'work' && step.reps
        ? `${rep} di ${step.reps} ripetizioni${side}`
        : step.sides === 2
          ? sideLabel(step, el).replace(/^./, (c) => c.toUpperCase())
          : step.kind === 'work'
            ? 'Tieni il ritmo fino alla fine'
            : '';
    const nextStep = steps[s.index + 1];
    body = (
      <>
        {band ? (
          <div class="w-chip glass">
            <BandLoop color={theme.text} size={26} stroke={3.4} />
            Elastico {COLORS[band].name.toLowerCase()}
          </div>
        ) : zone ? (
          <div class="w-chip glass">
            <PlatformIcon handles={zone} size={28} board={theme.text} />
            Maniglie sul {COLORS[zone].name.toLowerCase()}, zona {ex.platformZone}
          </div>
        ) : null}
        <h1 class="w-name" style={{ fontSize: nameSize(step.name), marginTop: band || zone ? 10 : 18 }}>
          {step.name}
        </h1>
        <div class="w-timer">{formatClock(rem)}</div>
        <div class="w-progress">
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        {line && <div class="w-reps">{line}</div>}
        <div class="w-cad">{step.kind === 'work' ? ex.cadence : ex.setup}</div>
        {step.kind !== 'work' && nextStep && nextStep.kind === step.kind && <div class="w-cad">Poi: {nextStep.name.toLowerCase()}</div>}
        {paused && <div class="w-paused">In pausa</div>}
        {stats}
        {controls}
      </>
    );
  }

  return (
    <div class={`workout${step.kind === 'rest' ? ' rest' : ''}${lightBg ? ' light-bg' : ''}`} style={style}>
      <div class="workout-inner">
        <div class="w-top">
          <button type="button" aria-label="Termina" onClick={openExit}>
            <IconClose />
          </button>
          <span>{center}</span>
          <span>{right}</span>
        </div>
        {body}
      </div>
      {exitOpen && (
        <Sheet title="Vuoi fermarti?" text="Puoi salvare quello che hai fatto finora oppure uscire senza salvare." onClose={closeExit}>
          <button type="button" class="btn" onClick={closeExit}>
            Continua l'allenamento
          </button>
          <button type="button" class="btn secondary" onClick={finish}>
            Termina e salva
          </button>
          <button type="button" class="btn danger" onClick={onQuit}>
            Esci senza salvare
          </button>
        </Sheet>
      )}
    </div>
  );
}
