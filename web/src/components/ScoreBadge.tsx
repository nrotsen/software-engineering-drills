import { formatPoints, percent } from '@core/scoring';
import type { ItemOutcome } from '@core/grading';

/**
 * El color del puntaje sale de los mismos umbrales que usa la CLI
 * (`src/cli/summary.ts`). El criterio es compartido; el pintado no.
 */
export function ScoreBadge({ score, size = 'sm' }: { score: ItemOutcome; size?: 'sm' | 'lg' }) {
  const pct = percent(score);
  const tone =
    pct >= 80
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/60'
      : pct >= 50
        ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/60'
        : 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800/60';
  const dims = size === 'lg' ? 'px-4 py-2 text-base' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${tone} ${dims}`}>
      {formatPoints(score.earned)}/{formatPoints(score.possible)}
      <span className="opacity-60">·</span>
      {pct}%
    </span>
  );
}
