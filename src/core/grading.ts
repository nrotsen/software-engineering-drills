import type { ScorableItem } from './domain/item.js';

/**
 * LA CORRECCION, extraida de los renderers.
 *
 * Antes esta logica vivia adentro de los handlers de la terminal: el handler
 * de multiple choice decidia `picked.correct`, el numerico hacia la resta con
 * la tolerancia. Funcionaba, pero mezclaba dos cosas de naturaleza distinta:
 *
 *   - QUE esta bien            -> una regla del dominio, pura, sin plataforma
 *   - COMO se pide y se pinta  -> presentacion, distinta en terminal y en web
 *
 * Separarlas es lo que hace posible que la CLI y la web compartan la
 * correccion sin compartir una sola linea de UI. Si manana cambias la
 * tolerancia de los numericos, lo tocas aca y las dos apps cambian juntas.
 *
 * Fijate que `grade` es una funcion pura: mismos argumentos, mismo resultado,
 * sin IO. Eso la hace trivial de testear y de razonar.
 */

/** Puntos obtenidos sobre puntos posibles. Teoria y diagramas dan 0 de 0. */
export interface ItemOutcome {
  readonly earned: number;
  readonly possible: number;
}

export const NOT_SCORED: ItemOutcome = { earned: 0, possible: 0 };

/** Autoevaluacion de un ejercicio de codigo: le pegue / mas o menos / no. */
export type SelfGrade = 1 | 0.5 | 0;

/**
 * La respuesta del usuario, independiente de como se haya ingresado.
 *
 * Es una union discriminada por `kind`, igual que `Item`: el handler de la
 * terminal la construye desde un prompt de inquirer y el reducer de React
 * desde un onClick, pero `grade` recibe exactamente lo mismo en los dos casos.
 *
 * `choiceIndex` es el indice en `item.choices` ORIGINAL, no en el orden
 * barajado que ve el usuario. La capa de presentacion es la responsable de
 * traducir "la tercera que estoy mostrando" a "la primera del array". Asi la
 * respuesta es serializable y sigue significando lo mismo fuera de contexto.
 */
export type Answer =
  | { readonly kind: 'multipleChoice'; readonly choiceIndex: number }
  | { readonly kind: 'trueFalse'; readonly value: boolean }
  | { readonly kind: 'numeric'; readonly value: number }
  | { readonly kind: 'code'; readonly selfGrade: SelfGrade }
  | { readonly kind: 'code'; readonly choiceIndex: number };

/** ¿La respuesta es correcta? Para `code` en modo escrito lo decide el usuario. */
export function isCorrect(item: ScorableItem, answer: Answer): boolean {
  switch (item.kind) {
    case 'multipleChoice':
      assertKind(answer, 'multipleChoice');
      return item.choices[answer.choiceIndex]?.correct === true;
    case 'trueFalse':
      assertKind(answer, 'trueFalse');
      return answer.value === item.answer;
    case 'numeric':
      assertKind(answer, 'numeric');
      return Math.abs(answer.value - item.answer) <= (item.tolerance ?? 0);
    case 'code':
      assertKind(answer, 'code');
      if ('choiceIndex' in answer) {
        return item.choices?.[answer.choiceIndex]?.correct === true;
      }
      return answer.selfGrade === 1;
  }
}

export function grade(item: ScorableItem, answer: Answer): ItemOutcome {
  if (item.kind === 'code') {
    assertKind(answer, 'code');
    if ('choiceIndex' in answer) {
      // Modo MC: la correccion es objetiva, sin credito parcial.
      return { earned: isCorrect(item, answer) ? 1 : 0, possible: 1 };
    }
    // Modo escrito: unico item con credito parcial. La respuesta abierta rara
    // vez es binaria, y forzarla a serlo desincentiva la autoevaluacion honesta.
    return { earned: answer.selfGrade, possible: 1 };
  }
  return { earned: isCorrect(item, answer) ? 1 : 0, possible: 1 };
}

/**
 * Guarda de tipos: estrecha `Answer` al miembro que corresponde al item.
 * En la practica nunca deberia fallar (la UI construye la respuesta a partir
 * del item), pero preferimos un error ruidoso a puntuar cualquier cosa.
 */
function assertKind<K extends Answer['kind']>(
  answer: Answer,
  kind: K,
): asserts answer is Extract<Answer, { kind: K }> {
  if (answer.kind !== kind) {
    throw new Error(`Respuesta de tipo "${answer.kind}" para un ítem de tipo "${kind}"`);
  }
}
