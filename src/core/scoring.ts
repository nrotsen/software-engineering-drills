import type { ItemOutcome } from './grading.js';

export function addOutcome(a: ItemOutcome, b: ItemOutcome): ItemOutcome {
  return { earned: a.earned + b.earned, possible: a.possible + b.possible };
}

/** 8 -> "8", 8.5 -> "8.5". Evita el ruido de "8.0/12". */
export function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function percent({ earned, possible }: ItemOutcome): number {
  return possible === 0 ? 0 : Math.round((earned / possible) * 100);
}
