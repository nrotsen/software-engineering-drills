import type { TheoryItem } from '../../core/domain/item.js';
import { theme, icons } from '../theme.js';
import { indent, wrap } from '../layout.js';
import { NOT_SCORED, type Handler } from './types.js';

export const theoryHandler: Handler<TheoryItem> = async (item, { io }) => {
  io.print(theme.badge('TEORIA') + ' ' + theme.section(item.title));
  io.print();
  io.print(indent(theme.theory(wrap(item.body, 74))));
  io.print();
  io.print(indent(theme.analogy(`${icons.arrow} ${wrap(item.analogy, 72)}`)));
  io.print();
  await io.pause();
  return NOT_SCORED;
};
