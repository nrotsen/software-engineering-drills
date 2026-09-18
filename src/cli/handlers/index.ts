import type { Item, ItemKind } from '../../core/domain/item.js';
import { theoryHandler } from './theory.js';
import { diagramHandler } from './diagram.js';
import { multipleChoiceHandler } from './multiple-choice.js';
import { trueFalseHandler } from './true-false.js';
import { codeHandler } from './code.js';
import { numericHandler } from './numeric.js';
import type { Handler, HandlerCtx, ItemOutcome } from './types.js';

/**
 * DISPATCH TABLE (Strategy con funciones).
 *
 * El tipo mapeado `{ [K in ItemKind]: Handler<Extract<Item, {kind: K}>> }`
 * hace dos cosas a la vez:
 *   1. Obliga a que exista un handler por cada `kind`  -> si agregas un tipo
 *      de item y te olvidas de registrarlo, no compila.
 *   2. Le da a cada handler el tipo ESTRECHO de su item -> dentro de
 *      `numericHandler` el item ya es `NumericItem`, sin casts ni `as`.
 *
 * Alternativa descartada: un `switch` gigante en el motor. Tambien es
 * exhaustivo, pero mete el render de los 6 tipos en un solo archivo que crece
 * sin freno. Aca cada tipo es un archivo de ~30 lineas.
 */
const table: { [K in ItemKind]: Handler<Extract<Item, { kind: K }>> } = {
  theory: theoryHandler,
  diagram: diagramHandler,
  multipleChoice: multipleChoiceHandler,
  trueFalse: trueFalseHandler,
  code: codeHandler,
  numeric: numericHandler,
};

export function runItem(item: Item, ctx: HandlerCtx): Promise<ItemOutcome> {
  // Unico `as` del motor: TS no puede correlacionar la union del item con la
  // union de handlers en el punto de llamada. Queda encapsulado aca.
  const handler = table[item.kind] as Handler<Item>;
  return handler(item, ctx);
}

export type { HandlerCtx, ItemOutcome } from './types.js';
