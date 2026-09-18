import type { TrueFalseItem } from '../../core/domain/item.js';
import { theme } from '../theme.js';
import { wrap } from '../layout.js';
import { grade, isCorrect } from '../../core/grading.js';
import { explain, verdict } from './feedback.js';
import { type Handler } from './types.js';

export const trueFalseHandler: Handler<TrueFalseItem> = async (item, { io }) => {
  io.print(theme.question('¿Verdadero o falso?'));
  io.print();
  io.print(theme.theory(wrap(item.statement, 74)));
  io.print();

  const picked = await io.select<boolean>('Tu respuesta', [
    { name: '1) Verdadero', value: true },
    { name: '2) Falso', value: false },
  ]);

  const answer = { kind: 'trueFalse', value: picked } as const;
  verdict(io, isCorrect(item, answer));
  io.print(theme.dim(`   La afirmación es ${item.answer ? 'VERDADERA' : 'FALSA'}.`));
  io.print();
  explain(io, item.why);
  io.print();

  await io.pause();
  return grade(item, answer);
};
