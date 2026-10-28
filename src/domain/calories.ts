import type { Profile, Step } from './types';

type Body = Pick<Profile, 'sex' | 'weightKg' | 'age'>;

/** Sotto questa soglia la formula sul battito non è affidabile. */
const HR_MIN_RELIABLE = 90;

export function metKcal(met: number, weightKg: number, seconds: number): number {
  return (met * weightKg * seconds) / 3600;
}

/** Keytel et al. 2005, senza VO2max. */
export function hrKcalPerMin(hr: number, { sex, weightKg: w, age: a }: Body): number {
  const male = (-55.0969 + 0.6309 * hr + 0.1988 * w + 0.2017 * a) / 4.184;
  const female = (-20.4022 + 0.4472 * hr - 0.1263 * w + 0.074 * a) / 4.184;
  const v = sex === 'M' ? male : sex === 'F' ? female : (male + female) / 2;
  return Math.max(v, 0);
}

export function kcalPerSecond(met: number, hr: number | undefined, body: Body): number {
  if (hr !== undefined && hr >= HR_MIN_RELIABLE) return hrKcalPerMin(hr, body) / 60;
  return metKcal(met, body.weightKg, 1);
}

export function estimateKcal(steps: Step[], weightKg: number): number {
  return steps.reduce((sum, s) => sum + metKcal(s.met, weightKg, s.durationSec), 0);
}

/** Tanaka et al. 2001. */
export function hrMax(age: number): number {
  return Math.round(208 - 0.7 * age);
}
