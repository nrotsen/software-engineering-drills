import type { TrueFalseItem } from '@core/domain/item';
import { isCorrect } from '@core/grading';
import { Card, KindBadge } from '../components/Card.js';
import { Verdict } from '../components/Verdict.js';
import { CodeExampleDisclosure } from './CodeExampleDisclosure.js';
import type { ItemViewProps } from './types.js';

export function TrueFalseView({ item, answered, onAnswer }: ItemViewProps<TrueFalseItem>) {
  const picked = answered?.answer.kind === 'trueFalse' ? answered.answer.value : undefined;
  const locked = answered !== undefined;

  return (
    <Card className="p-6 sm:p-8">
      <KindBadge label="Verdadero o falso" tone="accent" />
      <h2 className="prose-study mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {item.statement}
      </h2>

      <div className="mt-5 flex gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            disabled={locked}
            onClick={() => onAnswer({ kind: 'trueFalse', value })}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${buttonClass(
              locked,
              value === item.answer,
              value === picked,
            )}`}
          >
            {value ? 'Verdadero' : 'Falso'}
          </button>
        ))}
      </div>

      {locked && (
        <Verdict correct={isCorrect(item, answered.answer)} why={item.why}>
          La afirmación es <strong>{item.answer ? 'verdadera' : 'falsa'}</strong>.
        </Verdict>
      )}

      {locked && item.codeExample && <CodeExampleDisclosure code={item.codeExample} />}
    </Card>
  );
}

function buttonClass(locked: boolean, isRight: boolean, isPicked: boolean): string {
  if (!locked)
    return 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/40';
  if (isRight)
    return 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200';
  if (isPicked)
    return 'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200';
  return 'border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500';
}
