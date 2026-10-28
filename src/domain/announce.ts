import { COLORS, bandColor } from './colors';
import { getExercise } from './exercises';
import type { Equipment, Step } from './types';

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Cosa prendere in mano per l'esercizio: elastico o posizione delle maniglie. */
function gearHint(exerciseId: string, bandId: string | undefined, equipment: Equipment): string {
  const band = bandColor(equipment, bandId);
  if (band) return `: prendi l’elastico ${COLORS[band].name.toLowerCase()}`;
  const zone = getExercise(exerciseId).platformZone;
  if (zone && equipment.platform) return `: maniglie sul ${COLORS[equipment.platform.zoneColors[zone]].name.toLowerCase()}`;
  return '';
}

function holdText(step: Step): string {
  return step.sides === 2 ? `${step.durationSec / 2} secondi per lato` : `${step.durationSec} secondi`;
}

export function isGetReady(steps: Step[], index: number): boolean {
  const step = steps[index];
  const prev = steps[index - 1];
  return step?.kind === 'rest' && (!prev || prev.kind !== 'work');
}

/** Frase letta dalla voce guida all'inizio di un passo. */
export function announcement(steps: Step[], index: number, equipment: Equipment): string {
  const step = steps[index];
  const prev = steps[index - 1];

  if (step.kind === 'warmup' || step.kind === 'cooldown') {
    const first = prev?.kind !== step.kind;
    if (!first) return `${step.name}.`;
    const intro = step.kind === 'warmup' ? 'Riscaldamento' : 'Defaticamento';
    return `${intro}. ${step.name}, ${holdText(step)}.`;
  }

  if (step.kind === 'work') {
    const sets = step.totalSets && step.totalSets > 1 ? `Serie ${step.set} di ${step.totalSets}, ` : '';
    const dose = step.reps ? `${step.reps} ripetizioni${step.sides === 2 ? ' per lato' : ''}` : holdText(step);
    const text = `${sets}${dose}`;
    return `${step.name}. ${text.charAt(0).toUpperCase()}${text.slice(1)}. Via!`;
  }

  const next = step.next!;
  const hint = gearHint(next.exerciseId, next.bandId, equipment);
  if (isGetReady(steps, index)) return `Preparati. Si parte con ${lowerFirst(next.name)}${hint}.`;
  const rest = `Riposo, ${step.durationSec} secondi.`;
  if (prev?.exerciseId === next.exerciseId) return rest;
  return `${rest} Poi ${lowerFirst(next.name)}${hint}.`;
}
