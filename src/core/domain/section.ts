import type { Item } from './item.js';

/** El temario es cerrado y conocido: union de literales, no `string`. */
export type SectionId = 'oop' | 'diagrams' | 'concurrency' | 'patterns';

/**
 * `0` es el nivel de INTRODUCCION, opcional por seccion. No lleva items
 * puntuables; sirve para dar vocabulario antes del nivel 1.
 */
export type LevelNumber = 0 | 1 | 2 | 3;

export interface Level {
  readonly level: LevelNumber;
  /** Titulo corto, se muestra en el menu. */
  readonly title: string;
  /** Que vas a poder hacer al terminar el nivel. */
  readonly goal: string;
  readonly items: readonly Item[];
  /** Bullets del mini-resumen final. */
  readonly summary: readonly string[];
}

export interface Section {
  readonly id: SectionId;
  readonly title: string;
  readonly blurb: string;
  readonly levels: readonly Level[];
}

/** Clave estable de un nivel dentro del progreso guardado. */
export function levelKey(sectionId: SectionId, level: LevelNumber): string {
  return `${sectionId}:${level}`;
}
