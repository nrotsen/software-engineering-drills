import type { NumericItem } from '../../core/domain/item.js';
import { theme } from '../theme.js';
import { wrap } from '../layout.js';
import { grade, isCorrect } from '../../core/grading.js';
import { explain, verdict } from './feedback.js';
import { type Handler } from './types.js';

export const numericHandler: Handler<NumericItem> = async (item, { io }) => {
  io.print(theme.question(wrap(item.prompt, 74)));
  io.print();

  const unit = item.unit ?? '';
  const value = await io.number('Tu respuesta', unit || undefined);
  const answer = { kind: 'numeric', value } as const;
  const correct = isCorrect(item, answer);

  verdict(io, correct);
  io.print(
    theme.dim(`   Respuesta: ${item.answer}${unit ? ' ' + unit : ''}`) +
      (correct ? '' : theme.dim(`  |  vos pusiste ${value}${unit ? ' ' + unit : ''}`)),
  );
  io.print();
  explain(io, item.why);
  io.print();

  await io.pause();
  return grade(item, answer);
};
