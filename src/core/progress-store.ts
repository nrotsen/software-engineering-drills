import type { LevelResult, ProgressState } from './domain/progress.js';

/**
 * REPOSITORY: el motor y el menu piden "el progreso", no "el archivo JSON".
 *
 * Trade-off: hoy hay una sola implementacion (JSON en disco), asi que la
 * interfaz es indireccion pura. Se paga igual porque (a) los tests usan una
 * impl en memoria y no tocan el filesystem, y (b) el dia que quieras SQLite,
 * sync con un backend, o multi-perfil, cambias la impl y nada mas.
 */
export interface ProgressStore {
  load(): Promise<ProgressState>;
  /** Guarda el resultado de un nivel. Ultimo intento gana. */
  record(result: LevelResult): Promise<void>;
  reset(): Promise<void>;
}
