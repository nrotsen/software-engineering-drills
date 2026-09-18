import type { DiagramItem } from '../../core/domain/item.js';
import { theme } from '../theme.js';
import { dedent, indent, wrap } from '../layout.js';
import { NOT_SCORED, type Handler } from './types.js';

export const diagramHandler: Handler<DiagramItem> = async (item, { io }) => {
  io.print(theme.badge('DIAGRAMA') + ' ' + theme.section(item.title));
  io.print();
  io.print(theme.diagram(indent(dedent(item.ascii))));
  io.print();
  io.print(indent(theme.why(wrap(item.caption, 74))));
  io.print();
  await io.pause();
  return NOT_SCORED;
};
