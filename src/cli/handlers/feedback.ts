import { theme, icons } from '../theme.js';
import { indent, wrap } from '../layout.js';
import type { Io } from '../io.js';

/** Linea de veredicto, siempre igual, siempre en el mismo lugar. */
export function verdict(io: Io, correct: boolean): void {
  io.print();
  io.print(correct ? theme.ok(`${icons.ok} Correcto`) : theme.err(`${icons.err} Incorrecto`));
}

/** Bloque de explicacion en gris, indentado. */
export function explain(io: Io, text: string): void {
  io.print(indent(theme.why(wrap(text, 74))));
}
