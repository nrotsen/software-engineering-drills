import type { TheoryItem } from '@core/domain/item';
import { Card, KindBadge } from '../components/Card.js';
import type { ItemViewProps } from './types.js';

export function TheoryView({ item }: ItemViewProps<TheoryItem>) {
  return (
    <Card className="p-6 sm:p-8">
      <KindBadge label="Teoría" />
      <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {item.title}
      </h2>
      <p className="prose-study mt-4 text-slate-700 dark:text-slate-300">{item.body}</p>

      {/* La analogia va visualmente separada: es otro modo de pensar, no mas texto */}
      <div className="mt-6 rounded-lg border-l-3 border-violet-400 bg-violet-50/60 p-4 dark:border-violet-500 dark:bg-violet-950/30">
        <p className="text-[11px] font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
          Analogía
        </p>
        <p className="prose-study mt-1 text-slate-700 italic dark:text-slate-300">{item.analogy}</p>
      </div>
    </Card>
  );
}
