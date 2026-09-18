import type { LevelResult, ProgressState } from './domain/progress.js';
import { EMPTY_PROGRESS } from './domain/progress.js';
import { levelKey } from './domain/section.js';
import type { ProgressStore } from './progress-store.js';

/** Impl para tests: mismo contrato, cero filesystem. */
export class MemoryProgressStore implements ProgressStore {
  private state: ProgressState = EMPTY_PROGRESS;

  async load(): Promise<ProgressState> {
    return this.state;
  }

  async record(result: LevelResult): Promise<void> {
    this.state = {
      version: 1,
      results: { ...this.state.results, [levelKey(result.sectionId, result.level)]: result },
    };
  }

  async reset(): Promise<void> {
    this.state = EMPTY_PROGRESS;
  }
}
