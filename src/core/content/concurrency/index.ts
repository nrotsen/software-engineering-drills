import type { Section } from '../../domain/section.js';
import { level1 } from './level-1.js';
import { level2 } from './level-2.js';
import { level3 } from './level-3.js';

export const section: Section = {
  id: 'concurrency',
  title: 'C · Concurrencia y paralelismo',
  blurb: 'Secuencial vs paralelo, fan-out, cálculo de latencia, manejo de fallos y límites.',
  levels: [level1, level2, level3],
};
