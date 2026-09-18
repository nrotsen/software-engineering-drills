import type { Level, Section } from '../core/domain/section.js';
import type { LevelResult } from '../core/domain/progress.js';
import type { Io } from './io.js';
import { theme, icons } from './theme.js';
import { indent, rule, wrap } from './layout.js';
import { formatPoints, percent } from '../core/scoring.js';

export function renderLevelSummary(io: Io, section: Section, level: Level, result: LevelResult): void {
  const pct = percent(result);
  const paint = pct >= 80 ? theme.ok : pct >= 50 ? theme.partial : theme.err;

  io.print();
  io.print(theme.dim(rule('═')));
  io.print(theme.title(`Resumen — ${section.title} · Nivel ${level.level}: ${level.title}`));
  io.print(theme.dim(rule('═')));
  io.print();

  for (const point of level.summary) {
    io.print(indent(`${theme.accent(icons.bullet)} ${wrap(point, 72).replace(/\n/g, '\n  ')}`));
  }

  io.print();
  io.print(
    indent(
      paint(
        `Puntaje: ${formatPoints(result.earned)}/${formatPoints(result.possible)}  (${pct}%)`,
      ),
    ),
  );
  io.print(indent(theme.dim(verdictLine(pct))));
  io.print();
}

function verdictLine(pct: number): string {
  if (pct >= 90) return 'Dominado. Pasá al siguiente nivel.';
  if (pct >= 70) return 'Bien. Repasá los que fallaste y seguí.';
  if (pct >= 50) return 'La idea está; los detalles todavía no. Vale re-correr el nivel.';
  return 'Conviene volver a correr este nivel antes de avanzar.';
}
