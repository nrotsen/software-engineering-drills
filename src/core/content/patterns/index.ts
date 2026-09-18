import type { Section } from '../../domain/section.js';
import { level1 } from './level-1.js';
import { level2 } from './level-2.js';
import { level3 } from './level-3.js';

export const section: Section = {
  id: 'patterns',
  title: 'D · Patrones de diseño',
  blurb: 'Las 3 familias, los seis comunes en JS/TS, y cuándo NO forzarlos.',
  levels: [level1, level2, level3],
};
