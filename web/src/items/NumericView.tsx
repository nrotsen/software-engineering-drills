import { useState, type FormEvent } from 'react';
import type { NumericItem } from '@core/domain/item';
import { isCorrect } from '@core/grading';
import { Card, KindBadge } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Verdict } from '../components/Verdict.js';
import type { ItemViewProps } from './types.js';

export function NumericView({ item, answered, onAnswer }: ItemViewProps<NumericItem>) {
  const [draft, setDraft] = useState('');
  const locked = answered !== undefined;
  const given = answered?.answer.kind === 'numeric' ? answered.answer.value : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(draft.replace(',', '.'));
    if (!Number.isFinite(value)) return;
    onAnswer({ kind: 'numeric', value });
  };

  return (
    <Card className="p-6 sm:p-8">
      <KindBadge label="Cálculo" tone="accent" />
      <h2 className="prose-study mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {item.prompt}
      </h2>
      {item.hint && !locked && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pista: {item.hint}</p>
      )}

      <form onSubmit={submit} className="mt-5 flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          disabled={locked}
          value={locked ? String(given ?? '') : draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="0"
          className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-950 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        />
        {item.unit && <span className="text-sm text-slate-500 dark:text-slate-400">{item.unit}</span>}
        {!locked && (
          <Button type="submit" disabled={draft.trim() === ''}>
            Responder
          </Button>
        )}
      </form>

      {locked && (
        <Verdict correct={isCorrect(item, answered.answer)} why={item.why}>
          Respuesta:{' '}
          <strong>
            {item.answer} {item.unit}
          </strong>
        </Verdict>
      )}
    </Card>
  );
}
