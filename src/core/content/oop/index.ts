import type { Section } from '../../domain/section.js';
import { level0 } from './level-0.js';
import { level1 } from './level-1.js';
import { level2 } from './level-2.js';
import { level3 } from './level-3.js';

export const section: Section = {
  id: 'oop',
  title: 'A · Programación Orientada a Objetos',
  blurb: 'Los 4 pilares, composición vs herencia, contratos y SOLID con sus trade-offs.',
  levels: [level0, level1, level2, level3],
};
