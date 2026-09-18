import type { Section } from '../../domain/section.js';
import { level1 } from './level-1.js';
import { level2 } from './level-2.js';
import { level3 } from './level-3.js';

export const section: Section = {
  id: 'diagrams',
  title: 'B · Diagramas y modelado',
  blurb: 'Flujo, secuencia y arquitectura: qué pregunta responde cada uno y cuál elegir.',
  levels: [level1, level2, level3],
};
