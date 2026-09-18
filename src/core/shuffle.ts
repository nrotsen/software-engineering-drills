/** Fisher-Yates. `rng` inyectable para poder testear. */
export function shuffle<T>(xs: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** Para tests: no baraja. */
export const noShuffle = <T>(xs: readonly T[]): T[] => [...xs];

/**
 * Devuelve una permutacion de [0..length-1]. Barajamos INDICES, no elementos:
 * asi la capa de presentacion sabe siempre a que opcion original corresponde
 * lo que esta mostrando, y puede construir un `Answer` con el indice real.
 */
export function indexOrder(
  length: number,
  shuffleFn: <T>(xs: readonly T[]) => T[] = shuffle,
): number[] {
  return shuffleFn(Array.from({ length }, (_, i) => i));
}
