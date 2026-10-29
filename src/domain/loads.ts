import { getExercise } from './exercises';
import type { BandLoad, Equipment, Exercise, Prescription, Weight } from './types';

/** Elastico o peso: basta sapere quanto tira. */
interface Load {
  id: string;
  kg: number;
}

export function isBodyweight(ex: Exercise): boolean {
  return ex.requires.length === 0 && !ex.weight;
}

/** Pesi con cui si può fare l'esercizio, in base a come si impugnano. */
export function compatibleWeights(ex: Exercise, weights: Weight[]): Weight[] {
  return ex.weight ? weights.filter((w) => ex.weight!.includes(w.use)) : [];
}

/** Il più leggero per 'light', quello in mezzo per 'medium', il più pesante per 'heavy', spostato di `shift`. */
export function chooseLoad(load: BandLoad, items: Load[], shift: number): string | undefined {
  const sorted = [...items].sort((a, b) => a.kg - b.kg);
  const n = sorted.length;
  if (n === 0) return undefined;
  const base = load === 'light' ? 0 : load === 'medium' ? Math.floor((n - 1) / 2) : n - 1;
  const i = Math.min(n - 1, Math.max(0, base + shift));
  return sorted[i].id;
}

/** Il carico subito più duro (o più leggero) di quello attuale; due pesi uguali non contano come un passo. */
function neighbour(items: Load[], id: string, dir: 1 | -1): string | undefined {
  const current = items.find((x) => x.id === id);
  if (!current) return undefined;
  const sorted = [...items].sort((a, b) => a.kg - b.kg);
  const found = dir === 1 ? sorted.find((x) => x.kg > current.kg) : sorted.reverse().find((x) => x.kg < current.kg);
  return found?.id;
}

/** Elastico o peso successivo per la prescrizione, se esiste. */
export function stepLoad(p: Prescription, equipment: Equipment, dir: 1 | -1): Partial<Prescription> | undefined {
  if (p.bandId) {
    const id = neighbour(equipment.bands, p.bandId, dir);
    return id ? { bandId: id } : undefined;
  }
  if (p.weightId) {
    const id = neighbour(compatibleWeights(getExercise(p.exerciseId), equipment.weights), p.weightId, dir);
    return id ? { weightId: id } : undefined;
  }
  return undefined;
}

export function findWeight(equipment: Equipment, id: string | undefined): Weight | undefined {
  return id === undefined ? undefined : equipment.weights.find((w) => w.id === id);
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg`;
}
