import { useCallback, useEffect, useState } from 'react';
import type { LevelResult, ProgressState } from '@core/domain/progress';
import { EMPTY_PROGRESS } from '@core/domain/progress';
import { WebProgressStore, safeLocalStorage } from '../storage/web-progress-store.js';

const store = new WebProgressStore(safeLocalStorage());

/**
 * Estado del progreso en React + persistencia detras del mismo `ProgressStore`
 * que usa la CLI. El componente no sabe si abajo hay localStorage, un archivo
 * o una API: pide `record()` y listo.
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(EMPTY_PROGRESS);

  useEffect(() => {
    void store.load().then(setProgress);
  }, []);

  const record = useCallback(async (result: LevelResult) => {
    await store.record(result);
    setProgress(await store.load());
  }, []);

  const reset = useCallback(async () => {
    await store.reset();
    setProgress(await store.load());
  }, []);

  return { progress, record, reset };
}
