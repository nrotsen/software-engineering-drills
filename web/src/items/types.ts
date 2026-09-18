import type { Item } from '@core/domain/item';
import type { Answer } from '@core/grading';
import type { AnsweredItem } from '../session/levelSession.js';

/**
 * Props uniformes para TODAS las vistas de item.
 *
 * Teoria y diagrama ignoran `answered` / `onAnswer`, asi que la interfaz es un
 * poco mas ancha de lo que necesita cada componente. Es el mismo trade-off que
 * el `HandlerCtx` de la CLI: se acepta una interfaz comun algo generosa a
 * cambio de que la dispatch table sea homogenea y de que agregar un tipo de
 * item no obligue a tocar el despachador.
 */
export interface ItemViewProps<T extends Item = Item> {
  readonly item: T;
  readonly answered: AnsweredItem | undefined;
  /** Permutacion de indices para el multiple choice. Ver levelSession. */
  readonly choiceOrder: readonly number[] | undefined;
  readonly onAnswer: (answer: Answer) => void;
}
