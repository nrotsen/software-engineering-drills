import type { LevelResult, ProgressState } from '@core/domain/progress';
import { EMPTY_PROGRESS } from '@core/domain/progress';
import { levelKey } from '@core/domain/section';
import type { ProgressStore } from '@core/progress-store';

/**
 * El minimo que necesitamos de `localStorage`.
 *
 * Depender de esta interfaz en vez del `Storage` global nos da dos cosas:
 *   - Se puede testear en Node (sin jsdom) inyectando un objeto de mentira.
 *   - Si el navegador tiene el storage bloqueado (modo privado, cookies de
 *     terceros), se inyecta un stub en memoria y la app sigue andando.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * La SEGUNDA implementacion de `ProgressStore`.
 *
 * Este archivo es la justificacion retroactiva de por que la interfaz valia la
 * pena: cuando existia solo `JsonProgressStore`, el Repository parecia
 * indireccion gratis. Ahora la web guarda en localStorage sin que se toque una
 * linea del contrato ni del codigo que lo consume — y las dos implementaciones
 * pasan LA MISMA suite de tests (`tests/progress.test.ts`).
 *
 * El contrato es asincronico y localStorage es sincronico. Cumplirlo igual es
 * barato (`async` envuelve el valor) y mantiene una sola interfaz para las dos
 * plataformas. Al reves —hacer sincronico el contrato— habria sido imposible:
 * leer un archivo en Node no puede ser sincronico sin bloquear el proceso.
 */
export class WebProgressStore implements ProgressStore {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key = 'guia-interactiva:progress:v1',
  ) {}

  async load(): Promise<ProgressState> {
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null) return EMPTY_PROGRESS;
      const parsed: unknown = JSON.parse(raw);
      return isProgressState(parsed) ? parsed : EMPTY_PROGRESS;
    } catch {
      return EMPTY_PROGRESS;
    }
  }

  async record(result: LevelResult): Promise<void> {
    const current = await this.load();
    const next: ProgressState = {
      version: 1,
      results: { ...current.results, [levelKey(result.sectionId, result.level)]: result },
    };
    this.storage.setItem(this.key, JSON.stringify(next));
  }

  async reset(): Promise<void> {
    this.storage.removeItem(this.key);
  }
}

/** Fallback para cuando el navegador no deja tocar localStorage. */
export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** Devuelve localStorage si se puede usar de verdad; si no, uno en memoria. */
export function safeLocalStorage(): KeyValueStorage {
  try {
    const probe = '__guia_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v['version'] === 1 && typeof v['results'] === 'object' && v['results'] !== null;
}
