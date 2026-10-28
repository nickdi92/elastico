import type { JSX } from 'preact';
import type { ActiveWorkout } from '../../domain/activeWorkout';
import { stepTheme } from '../../domain/colors';
import { buildTimeline } from '../../domain/timeline';
import type { Equipment, Step } from '../../domain/types';
import { formatClock } from '../labels';
import { IconPlay } from './icons';

/** Dove si è fermato l'allenamento, in parole. */
export function pausedAt(step: Step): string {
  if (step.kind === 'warmup') return `Riscaldamento, ${step.name.toLowerCase()}`;
  if (step.kind === 'cooldown') return `Defaticamento, ${step.name.toLowerCase()}`;
  if (step.kind === 'rest') return `Riposo, poi ${step.next!.name.toLowerCase()}`;
  return `${step.name}, serie ${step.set} di ${step.totalSets}`;
}

export function activeInfo(active: ActiveWorkout) {
  const steps = buildTimeline(active.session);
  const step = steps[Math.min(active.player.index, steps.length - 1)];
  return { step, where: pausedAt(step), setsTotal: steps.filter((s) => s.kind === 'work').length };
}

/** Allenamento in pausa, sopra la barra delle sezioni: un tocco e si riprende. */
export function ActiveBar({ active, equipment, onResume }: { active: ActiveWorkout; equipment: Equipment; onResume: () => void }) {
  const { step, where } = activeInfo(active);
  const theme = stepTheme(step, equipment);
  const style = { '--from': theme.from, '--mid': theme.mid, '--to': theme.to, '--fg': theme.text } as JSX.CSSProperties;
  return (
    <button type="button" class="active-bar" style={style} onClick={onResume} aria-label={`Riprendi l'allenamento: ${where}`}>
      <span class="ab-text">
        <span>
          In pausa, {formatClock(active.totals.activeSec)} fatti
        </span>
        <b>{where}</b>
      </span>
      <span class="ab-play">
        <IconPlay />
      </span>
    </button>
  );
}
