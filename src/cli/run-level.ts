import type { Level, Section } from '../core/domain/section.js';
import type { LevelResult } from '../core/domain/progress.js';
import { isScorable } from '../core/domain/item.js';
import { theme } from './theme.js';
import { rule, wrap } from './layout.js';
import { runItem, type HandlerCtx } from './handlers/index.js';
import { addOutcome } from '../core/scoring.js';
import { renderLevelSummary } from './summary.js';

/**
 * El loop de un nivel. Es TODO el motor: itera items, delega el render al
 * handler que corresponda y acumula puntaje.
 *
 * Fijate lo que NO hay aca: ni un `if` por tipo de item, ni una sola mencion
 * a concurrencia / SOLID / patrones. El motor no sabe que estas estudiando.
 * Esa es la separacion contenido-motor que pediste, verificable por ausencia.
 */
export async function runLevel(section: Section, level: Level, ctx: HandlerCtx): Promise<LevelResult> {
  const { io } = ctx;
  const scorableTotal = level.items.filter(isScorable).length;
  let answered = 0;
  let score = { earned: 0, possible: 0 };

  io.clear();
  io.print(theme.dim(rule('═')));
  io.print(theme.title(`${section.title}  ·  Nivel ${level.level}: ${level.title}`));
  io.print(theme.dim(wrap(level.goal, 78)));
  io.print(theme.dim(rule('═')));
  io.print();

  for (const item of level.items) {
    if (isScorable(item)) {
      answered += 1;
      io.print(theme.dim(`[ ${answered}/${scorableTotal} ]`));
    }
    const outcome = await runItem(item, ctx);
    score = addOutcome(score, outcome);
    io.print(theme.dim(rule()));
    io.print();
  }

  const result: LevelResult = {
    sectionId: section.id,
    level: level.level,
    earned: score.earned,
    possible: score.possible,
    completedAt: new Date().toISOString(),
  };

  renderLevelSummary(io, section, level, result);
  return result;
}
