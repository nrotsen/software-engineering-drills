import { useEffect } from 'react';
import type { MultipleChoiceItem } from '@core/domain/item';
import { Card, KindBadge } from '../components/Card.js';
import { CodeBlock } from './CodeBlock.js';
import { CodeExampleDisclosure } from './CodeExampleDisclosure.js';
import type { ItemViewProps } from './types.js';

export function MultipleChoiceView({
  item,
  answered,
  choiceOrder,
  onAnswer,
}: ItemViewProps<MultipleChoiceItem>) {
  const order = choiceOrder ?? item.choices.map((_, i) => i);
  const chosen = answered?.answer.kind === 'multipleChoice' ? answered.answer.choiceIndex : undefined;
  const locked = answered !== undefined;

  // Teclas 1..n, como en la CLI. Cuesta 8 lineas y hace que responder una
  // tanda de preguntas no obligue a soltar el teclado.
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= order.length) {
        onAnswer({ kind: 'multipleChoice', choiceIndex: order[n - 1]! });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, order, onAnswer]);

  return (
    <Card className="p-6 sm:p-8">
      <KindBadge label="Multiple choice" tone="accent" />
      <h2 className="prose-study mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {item.prompt}
      </h2>

      {/* Mismo CodeBlock que los ítems de código: el snippet se lee igual sin
          importar si después respondés eligiendo o autoevaluándote. */}
      {item.snippet && (
        <div className="mt-4">
          <CodeBlock code={item.snippet} />
        </div>
      )}

      <ul className="mt-5 space-y-2.5">
        {order.map((original, shown) => {
          const choice = item.choices[original]!;
          return (
            <li key={original}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onAnswer({ kind: 'multipleChoice', choiceIndex: original })}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${optionClass(
                  locked,
                  choice.correct,
                  original === chosen,
                )}`}
              >
                <span className="mr-2 font-mono text-xs text-slate-400 dark:text-slate-500">
                  {shown + 1}
                </span>
                {choice.text}
                {locked && original === chosen && (
                  <span className="ml-2 text-xs font-semibold opacity-70">← tu elección</span>
                )}
              </button>

              {/* Al corregir se muestran TODAS las explicaciones, no solo la de
                  la correcta: entender por que la trampa era plausible es donde
                  esta el aprendizaje real. */}
              {locked && (
                <p className="prose-study mt-1.5 pr-2 pl-4 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {choice.why}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {locked && item.codeExample && <CodeExampleDisclosure code={item.codeExample} />}

      {locked && item.takeaway && (
        <p className="mt-6 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 dark:bg-slate-800 dark:text-slate-100">
          {item.takeaway}
        </p>
      )}
    </Card>
  );
}

function optionClass(locked: boolean, correct: boolean, isChosen: boolean): string {
  if (!locked)
    return 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/40';
  if (correct)
    return 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200';
  if (isChosen)
    return 'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200';
  return 'border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500';
}
