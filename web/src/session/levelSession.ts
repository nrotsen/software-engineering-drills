import type { Item, ScorableItem } from '@core/domain/item';
import { isScorable } from '@core/domain/item';
import type { Level } from '@core/domain/section';
import type { Answer, ItemOutcome } from '@core/grading';
import { grade } from '@core/grading';
import { indexOrder } from '@core/shuffle';

/**
 * LA MAQUINA DE ESTADOS DE UN NIVEL.
 *
 * Este es el equivalente web de `src/cli/run-level.ts` — y a proposito NO se
 * comparte con la CLI, aunque las reglas de correccion si.
 *
 * Por que no se puede compartir el orquestador:
 *
 *   CLI    el motor TIRA de la respuesta   const r = await io.select(...)
 *   React  la respuesta EMPUJA al estado   onClick={() => dispatch(...)}
 *
 * Es una inversion de control. El loop de la CLI se bloquea esperando; React
 * es una funcion de estado a UI que reacciona a eventos y no puede "esperar"
 * sin ceder el control. Forzar un unico orquestador (async generators, o un
 * `Io` falso cuyas promesas resuelve un onClick) es posible y es exactamente
 * el tipo de abstraccion ingeniosa que despues nadie puede debuggear.
 *
 * Lo que SI se comparte es `grade()`: la duplicacion es de FORMA, no de
 * REGLAS. Hay dos orquestadores, pero una sola definicion de que esta bien.
 */

export interface AnsweredItem {
  readonly answer: Answer;
  readonly outcome: ItemOutcome;
}

export interface SessionState {
  readonly items: readonly Item[];
  readonly index: number;
  readonly answers: Readonly<Record<string, AnsweredItem>>;
  /**
   * Orden barajado de las opciones, por id de item de multiple choice.
   * Se calcula UNA vez al iniciar la sesion: si se recalculara en cada render,
   * las opciones bailarian delante del usuario mientras las lee.
   */
  readonly choiceOrder: Readonly<Record<string, readonly number[]>>;
  readonly finished: boolean;
}

export type SessionAction =
  | { readonly type: 'answer'; readonly item: ScorableItem; readonly answer: Answer }
  | { readonly type: 'next' }
  | { readonly type: 'back' };

/**
 * `initSession` NO es pura (baraja), y por eso vive fuera del reducer y se
 * pasa como inicializador perezoso de `useReducer`. El reducer en si queda
 * puro: mismo estado + misma accion => mismo estado nuevo, siempre.
 */
export function initSession(
  level: Level,
  shuffleFn?: <T>(xs: readonly T[]) => T[],
): SessionState {
  const choiceOrder: Record<string, readonly number[]> = {};
  for (const item of level.items) {
    if (item.kind === 'multipleChoice') {
      choiceOrder[item.id] = indexOrder(item.choices.length, shuffleFn);
    } else if (item.kind === 'code' && item.choices) {
      // Un CodeItem con choices ofrece el modo MC; el orden se fija una sola
      // vez al iniciar la sesion, igual que en multipleChoice.
      choiceOrder[item.id] = indexOrder(item.choices.length, shuffleFn);
    }
  }
  return { items: level.items, index: 0, answers: {}, choiceOrder, finished: false };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'answer': {
      // Responder dos veces el mismo item no deberia cambiar el puntaje.
      if (state.answers[action.item.id]) return state;
      const outcome = grade(action.item, action.answer);
      return {
        ...state,
        answers: { ...state.answers, [action.item.id]: { answer: action.answer, outcome } },
      };
    }
    case 'next': {
      const next = state.index + 1;
      return next >= state.items.length
        ? { ...state, finished: true }
        : { ...state, index: next };
    }
    case 'back':
      return { ...state, index: Math.max(0, state.index - 1), finished: false };
  }
}

/** Puntaje acumulado. Derivado del estado, nunca guardado por separado. */
export function sessionScore(state: SessionState): ItemOutcome {
  const scorables = state.items.filter(isScorable);
  const earned = Object.values(state.answers).reduce((sum, a) => sum + a.outcome.earned, 0);
  return { earned, possible: scorables.length };
}

export function currentItem(state: SessionState): Item {
  return state.items[state.index]!;
}

/** ¿Se puede avanzar? Teoria y diagramas: siempre. Lo demas: si ya respondiste. */
export function canAdvance(state: SessionState): boolean {
  const item = currentItem(state);
  return !isScorable(item) || state.answers[item.id] !== undefined;
}
