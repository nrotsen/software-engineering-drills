import type { LevelNumber, SectionId } from './section.js';

export interface LevelResult {
  readonly sectionId: SectionId;
  readonly level: LevelNumber;
  /** Puntos obtenidos. Puede tener decimales (credito parcial en `code`). */
  readonly earned: number;
  readonly possible: number;
  /** ISO 8601. */
  readonly completedAt: string;
}

export interface ProgressState {
  /** Version del esquema en disco: permite migrar sin romper archivos viejos. */
  readonly version: 1;
  /** Clave: `${sectionId}:${level}` (ver `levelKey`). */
  readonly results: Readonly<Record<string, LevelResult>>;
}

export const EMPTY_PROGRESS: ProgressState = { version: 1, results: {} };
