import type { CodeItem } from '../../core/domain/item.js';
import { theme, icons } from '../theme.js';
import { dedent, indent, rule, wrap } from '../layout.js';
import { grade, type SelfGrade } from '../../core/grading.js';
import { explain } from './feedback.js';
import { type Handler } from './types.js';

/**
 * Ejercicio abierto: no ejecutamos ni parseamos tu texto (seria adivinar), asi
 * que el puntaje sale de tu autoevaluacion. Trade-off consciente: menos
 * "objetivo" que un multiple choice, pero permite preguntas de diseno reales
 * ("que esta mal aca / como lo mejorarias") que no entran en 4 opciones.
 */
export const codeHandler: Handler<CodeItem> = async (item, { io }) => {
  io.print(theme.badge('CODIGO'));
  io.print(theme.question(wrap(item.ask, 74)));
  io.print();
  io.print(theme.dim(rule('┈')));
  io.print(theme.code(indent(dedent(item.snippet))));
  io.print(theme.dim(rule('┈')));
  io.print();

  await io.text(theme.dim('Tu respuesta (o Enter directo para revelarla)'));

  io.print();
  io.print(theme.accent('Respuesta:'));
  io.print(indent(theme.theory(wrap(item.answer, 74))));
  io.print();
  explain(io, item.why);
  io.print();

  const selfGrade = await io.select<SelfGrade>('¿Cómo te fue?', [
    { name: `1) ${icons.ok} Le pegué`, value: 1 },
    { name: `2) ${icons.partial} Más o menos (la idea sí, el detalle no)`, value: 0.5 },
    { name: `3) ${icons.err} No la tenía`, value: 0 },
  ]);

  io.print();
  return grade(item, { kind: 'code', selfGrade });
};
