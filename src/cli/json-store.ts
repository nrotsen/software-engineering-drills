import { readFile, writeFile, rename, rm, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { LevelResult, ProgressState } from '../core/domain/progress.js';
import { EMPTY_PROGRESS } from '../core/domain/progress.js';
import { levelKey } from '../core/domain/section.js';
import type { ProgressStore } from '../core/progress-store.js';

export const DEFAULT_PROGRESS_PATH = resolve(process.cwd(), 'progress.json');

export class JsonProgressStore implements ProgressStore {
  constructor(private readonly file: string = process.env['GUIA_PROGRESS_FILE'] ?? DEFAULT_PROGRESS_PATH) {}

  get path(): string {
    return this.file;
  }

  async load(): Promise<ProgressState> {
    try {
      const raw = await readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      return isProgressState(parsed) ? parsed : EMPTY_PROGRESS;
    } catch {
      // No existe todavia, o quedo corrupto: arrancar limpio es mejor que
      // reventar la app por un archivo de progreso. El contenido no se pierde.
      return EMPTY_PROGRESS;
    }
  }

  async record(result: LevelResult): Promise<void> {
    const current = await this.load();
    const next: ProgressState = {
      version: 1,
      results: { ...current.results, [levelKey(result.sectionId, result.level)]: result },
    };
    await this.writeAtomic(next);
  }

  async reset(): Promise<void> {
    await rm(this.file, { force: true });
  }

  /**
   * Escribir a un temporal y renombrar. `rename` es atomico dentro del mismo
   * filesystem, asi que un Ctrl-C en el peor momento te deja el archivo viejo
   * intacto en vez de un JSON truncado. Tres lineas que evitan el bug mas
   * molesto de este tipo de app.
   */
  private async writeAtomic(state: ProgressState): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8');
    await rename(tmp, this.file);
  }
}

/** Validacion minima del archivo en disco: es input externo, no confiamos. */
function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v['version'] === 1 && typeof v['results'] === 'object' && v['results'] !== null;
}
