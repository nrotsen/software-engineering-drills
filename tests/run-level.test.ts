import { describe, expect, it } from 'vitest';
import type { Section, Level } from '../src/core/domain/section.js';
import { runLevel } from '../src/cli/run-level.js';
import { noShuffle } from '../src/core/shuffle.js';
import { FakeIo } from './fake-io.js';

const section: Section = {
  id: 'concurrency',
  title: 'Test',
  blurb: '',
  levels: [],
};

const level: Level = {
  level: 1,
  title: 'Fixture',
  goal: '',
  summary: ['bullet'],
  items: [
    { id: 't', kind: 'theory', title: 'T', body: 'b', analogy: 'a' },
    {
      id: 'mc',
      kind: 'multipleChoice',
      prompt: '?',
      choices: [
        { text: 'buena', correct: true, why: 'w' },
        { text: 'mala', correct: false, why: 'w' },
      ],
    },
    { id: 'tf', kind: 'trueFalse', statement: 's', answer: true, why: 'w' },
    { id: 'n', kind: 'numeric', prompt: 'p', answer: 300, why: 'w' },
    { id: 'c', kind: 'code', ask: 'a', snippet: 's', answer: 'r', why: 'w' },
  ],
};

const ctx = (script: readonly unknown[]) => {
  const io = new FakeIo(script);
  return { io, ctx: { io, shuffle: noShuffle } };
};

describe('runLevel', () => {
  it('puntúa solo los items puntuables (teoría no cuenta)', async () => {
    // mc: opcion 0 (correcta) | tf: opcion 0 (=true, correcta) | numeric: 300 | code: texto + autoevaluacion 0 (=1 punto)
    const { ctx: c } = ctx([0, 0, 300, 'mi respuesta', 0]);
    const result = await runLevel(section, level, c);
    expect(result.possible).toBe(4);
    expect(result.earned).toBe(4);
  });

  it('cuenta mal las respuestas incorrectas y da crédito parcial en code', async () => {
    // mc: opcion 1 (mala) | tf: opcion 1 (=false, mala) | numeric: 250 (mal) | code: autoevaluacion 1 (=0.5)
    const { ctx: c } = ctx([1, 1, 250, '', 1]);
    const result = await runLevel(section, level, c);
    expect(result.earned).toBe(0.5);
    expect(result.possible).toBe(4);
  });

  it('respeta la tolerancia en items numéricos', async () => {
    const tolerant: Level = {
      ...level,
      items: [{ id: 'n', kind: 'numeric', prompt: 'p', answer: 300, tolerance: 10, why: 'w' }],
    };
    const { ctx: c } = ctx([295]);
    expect((await runLevel(section, tolerant, c)).earned).toBe(1);

    const { ctx: c2 } = ctx([280]);
    expect((await runLevel(section, tolerant, c2)).earned).toBe(0);
  });

  it('registra sección y nivel en el resultado', async () => {
    const { ctx: c } = ctx([0, 0, 300, '', 0]);
    const result = await runLevel(section, level, c);
    expect(result.sectionId).toBe('concurrency');
    expect(result.level).toBe(1);
    expect(Date.parse(result.completedAt)).not.toBeNaN();
  });
});
