import type { MultipleChoiceItem } from '../../core/domain/item.js';
import { grade, isCorrect } from '../../core/grading.js';
import { indexOrder } from '../../core/shuffle.js';
import { theme, icons } from '../theme.js';
import { dedent, indent, rule, wrap } from '../layout.js';
import { verdict } from './feedback.js';
import { type Handler } from './types.js';

export const multipleChoiceHandler: Handler<MultipleChoiceItem> = async (item, { io, shuffle }) => {
  // Barajamos INDICES, no opciones: asi podemos construir un `Answer` con el
  // indice ORIGINAL aunque el usuario haya visto las opciones en otro orden.
  // Se puede barajar justamente porque cada opcion trae su propio `why`.
  const order = indexOrder(item.choices.length, shuffle);

  io.print(theme.question(wrap(item.prompt, 74)));
  io.print();

  // Mismo bloque que usan los items de codigo, para que "leer un snippet" se
  // vea igual en toda la app sin importar como se responda despues.
  if (item.snippet) {
    io.print(theme.dim(rule('┈')));
    io.print(theme.code(indent(dedent(item.snippet))));
    io.print(theme.dim(rule('┈')));
    io.print();
  }

  const chosenIndex = await io.select<number>(
    'Tu respuesta',
    order.map((original, shown) => ({
      name: `${shown + 1}) ${item.choices[original]!.text}`,
      value: original,
    })),
  );

  // La correccion NO se decide aca: se delega a core/grading, que es lo mismo
  // que va a llamar la web. Este archivo solo pide input y pinta.
  const answer = { kind: 'multipleChoice', choiceIndex: chosenIndex } as const;
  verdict(io, isCorrect(item, answer));
  io.print();

  // Repasamos TODAS las opciones: lo que mas ensena es entender por que la
  // trampa era plausible, no solo cual era la correcta.
  for (const original of order) {
    const c = item.choices[original]!;
    const mark = c.correct ? theme.ok(icons.ok) : theme.err(icons.err);
    // Ojo: envolvemos el texto PLANO y recien despues coloreamos. `wrap` cuenta
    // caracteres, y los codigos ANSI de chalk cuentan como caracteres visibles
    // que no lo son -> si coloreas primero, las lineas quedan cortas y torcidas.
    const body = wrap(c.text, 68).replace(/\n/g, '\n  ');
    const label = original === chosenIndex ? `${body} ${theme.accent('← tu elección')}` : body;
    io.print(indent(`${mark} ${label}`));
    io.print(indent(theme.why(wrap(c.why, 68)), '    '));
    io.print();
  }

  if (item.takeaway) {
    io.print(indent(theme.accent(`${icons.arrow} ${wrap(item.takeaway, 70)}`)));
    io.print();
  }

  await io.pause();
  return grade(item, answer);
};
