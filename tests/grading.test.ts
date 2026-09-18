import { describe, expect, it } from 'vitest';
import type { CodeItem, MultipleChoiceItem, NumericItem, TrueFalseItem } from '@core/domain/item';
import { grade, isCorrect } from '@core/grading';

const mc: MultipleChoiceItem = {
  id: 'mc',
  kind: 'multipleChoice',
  prompt: '?',
  choices: [
    { text: 'mala', correct: false, why: 'w' },
    { text: 'buena', correct: true, why: 'w' },
  ],
};
const tf: TrueFalseItem = { id: 'tf', kind: 'trueFalse', statement: 's', answer: true, why: 'w' };
const num: NumericItem = { id: 'n', kind: 'numeric', prompt: 'p', answer: 300, why: 'w' };
const numTol: NumericItem = { ...num, id: 'n2', tolerance: 10 };
const code: CodeItem = { id: 'c', kind: 'code', ask: 'a', snippet: 's', answer: 'r', why: 'w' };

// Esta suite es la que hace que valga la pena haber extraido la correccion:
// prueba la regla UNA vez, y vale para la CLI y para la web.
describe('grade', () => {
  it('multiple choice: puntúa por el índice ORIGINAL, no por el mostrado', () => {
    expect(grade(mc, { kind: 'multipleChoice', choiceIndex: 1 })).toEqual({ earned: 1, possible: 1 });
    expect(grade(mc, { kind: 'multipleChoice', choiceIndex: 0 })).toEqual({ earned: 0, possible: 1 });
  });

  it('multiple choice: un índice fuera de rango es incorrecto, no una excepción', () => {
    expect(isCorrect(mc, { kind: 'multipleChoice', choiceIndex: 99 })).toBe(false);
  });

  it('verdadero/falso', () => {
    expect(grade(tf, { kind: 'trueFalse', value: true }).earned).toBe(1);
    expect(grade(tf, { kind: 'trueFalse', value: false }).earned).toBe(0);
  });

  it('numérico: exacto sin tolerancia', () => {
    expect(grade(num, { kind: 'numeric', value: 300 }).earned).toBe(1);
    expect(grade(num, { kind: 'numeric', value: 299 }).earned).toBe(0);
  });

  it('numérico: respeta la tolerancia en ambos sentidos', () => {
    expect(grade(numTol, { kind: 'numeric', value: 310 }).earned).toBe(1);
    expect(grade(numTol, { kind: 'numeric', value: 290 }).earned).toBe(1);
    expect(grade(numTol, { kind: 'numeric', value: 311 }).earned).toBe(0);
  });

  it('código: crédito parcial por autoevaluación', () => {
    expect(grade(code, { kind: 'code', selfGrade: 1 }).earned).toBe(1);
    expect(grade(code, { kind: 'code', selfGrade: 0.5 }).earned).toBe(0.5);
    expect(grade(code, { kind: 'code', selfGrade: 0 }).earned).toBe(0);
  });

  it('falla ruidosamente si la respuesta no corresponde al tipo de ítem', () => {
    expect(() => grade(num, { kind: 'trueFalse', value: true })).toThrow(/tipo/);
  });
});
