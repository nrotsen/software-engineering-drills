import { useCallback, useReducer } from 'react';
import type { ScorableItem } from '@core/domain/item';
import type { Level } from '@core/domain/section';
import type { Answer } from '@core/grading';
import { canAdvance, currentItem, initSession, sessionReducer, sessionScore } from './levelSession.js';

/**
 * Envuelve el reducer y expone una API con intencion (`answer`, `next`) en vez
 * de obligar a los componentes a construir acciones a mano. Los componentes
 * no saben que hay un reducer abajo; podrian ser useState y no cambiaria nada
 * de la firma.
 */
export function useLevelSession(level: Level) {
  const [state, dispatch] = useReducer(sessionReducer, level, (l) => initSession(l));

  const answer = useCallback(
    (item: ScorableItem, value: Answer) => dispatch({ type: 'answer', item, answer: value }),
    [],
  );
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const back = useCallback(() => dispatch({ type: 'back' }), []);

  return {
    state,
    item: currentItem(state),
    score: sessionScore(state),
    canAdvance: canAdvance(state),
    answered: state.answers[currentItem(state).id],
    answer,
    next,
    back,
  };
}
