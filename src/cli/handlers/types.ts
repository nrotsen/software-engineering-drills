import type { Item } from '../../core/domain/item.js';
import type { ItemOutcome } from '../../core/grading.js';
import type { Io } from '../io.js';

// ItemOutcome y NOT_SCORED viven en core/grading: los comparte la web.
export { NOT_SCORED } from '../../core/grading.js';
export type { ItemOutcome } from '../../core/grading.js';

/**
 * Dependencias que el motor le inyecta a cada handler.
 * `shuffle` esta aca (y no importado directo) para poder pasar la identidad
 * en los tests y tener corridas deterministas.
 */
export interface HandlerCtx {
  readonly io: Io;
  readonly shuffle: <T>(xs: readonly T[]) => T[];
}

export type Handler<T extends Item> = (item: T, ctx: HandlerCtx) => Promise<ItemOutcome>;
