import { Link } from 'react-router-dom';
import type { Level, Section } from '@core/domain/section';
import type { ItemOutcome } from '@core/grading';
import { percent } from '@core/scoring';
import { Card } from './Card.js';
import { ScoreBadge } from './ScoreBadge.js';
import { Button } from './Button.js';

/** Mismos umbrales y mismos mensajes que `src/cli/summary.ts`. */
function verdictLine(pct: number): string {
  if (pct >= 90) return 'Dominado. Pasá al siguiente nivel.';
  if (pct >= 70) return 'Bien. Repasá los que fallaste y seguí.';
  if (pct >= 50) return 'La idea está; los detalles todavía no. Vale re-correr el nivel.';
  return 'Conviene volver a correr este nivel antes de avanzar.';
}

export function LevelSummary({
  section,
  level,
  score,
  onRestart,
}: {
  section: Section;
  level: Level;
  score: ItemOutcome;
  onRestart: () => void;
}) {
  const pct = percent(score);

  return (
    <Card className="p-6 sm:p-8">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {section.title} · Nivel {level.level}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Nivel completado
        </h2>
        <ScoreBadge score={score} size="lg" />
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{verdictLine(pct)}</p>

      <h3 className="mt-8 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Qué cubriste
      </h3>
      <ul className="mt-3 space-y-2.5">
        {level.summary.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
            <span className="prose-study">{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={`/seccion/${section.id}`}>
          <Button>Volver a la sección</Button>
        </Link>
        <Button variant="secondary" onClick={onRestart}>
          Repetir el nivel
        </Button>
      </div>
    </Card>
  );
}
