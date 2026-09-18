import { useState } from 'react';
import type { CodeItem } from '@core/domain/item';
import type { SelfGrade } from '@core/grading';
import { Card, KindBadge } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { CodeBlock } from './CodeBlock.js';
import type { ItemViewProps } from './types.js';

type Mode = 'choice' | 'write';

const GRADES: readonly { value: SelfGrade; label: string; className: string }[] = [
  {
    value: 1,
    label: 'Le pegué',
    className:
      'border-emerald-400 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40',
  },
  {
    value: 0.5,
    label: 'Más o menos',
    className:
      'border-amber-400 text-amber-800 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-950/40',
  },
  {
    value: 0,
    label: 'No la tenía',
    className:
      'border-rose-400 text-rose-800 hover:bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-950/40',
  },
];

export function CodeView({ item, answered, choiceOrder, onAnswer }: ItemViewProps<CodeItem>) {
  const hasChoices = item.choices !== undefined && item.choices.length > 0;
  // Modo por defecto: si el item tiene choices, empezamos en MC (mas rapido).
  const [mode, setMode] = useState<Mode>(hasChoices ? 'choice' : 'write');
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState('');

  const locked = answered !== undefined;
  const showAnswer = revealed || locked;
  // Cuando ya respondio, forzamos la vista al modo en que respondio para que
  // "Anterior/Siguiente" reconstruya lo que el usuario vio.
  const effectiveMode: Mode =
    locked && answered.answer.kind === 'code' && 'choiceIndex' in answered.answer
      ? 'choice'
      : locked
        ? 'write'
        : mode;

  return (
    <Card className="p-6 sm:p-8">
      <KindBadge label="Código" tone="accent" />
      <h2 className="prose-study mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {item.ask}
      </h2>

      <div className="mt-4">
        <CodeBlock code={item.snippet} />
      </div>

      {hasChoices && !locked && (
        <ModeToggle mode={mode} onChange={setMode} disabled={revealed} />
      )}

      {effectiveMode === 'choice' && hasChoices ? (
        <ChoiceInput
          item={item}
          answered={answered}
          choiceOrder={choiceOrder}
          onAnswer={(choiceIndex) => onAnswer({ kind: 'code', choiceIndex })}
        />
      ) : (
        <WriteInput
          showAnswer={showAnswer}
          locked={locked}
          draft={draft}
          onDraft={setDraft}
          onReveal={() => setRevealed(true)}
          item={item}
          onSelfGrade={(selfGrade) => onAnswer({ kind: 'code', selfGrade })}
        />
      )}

      {locked && effectiveMode === 'write' && (
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          Te autoevaluaste con{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {answered.outcome.earned} de 1
          </strong>{' '}
          punto.
        </p>
      )}
    </Card>
  );
}

/**
 * Segmented control arriba del ejercicio. Sólo aparece si el item ofrece MC.
 * Se deshabilita cuando el usuario ya reveló la respuesta escrita (para que
 * cambiar de modo no le regale ver las opciones "resueltas").
 */
function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/60">
      {(['choice', 'write'] as const).map((m) => (
        <button
          key={m}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m)}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            mode === m
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
              : disabled
                ? 'text-slate-300 dark:text-slate-600'
                : 'cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          {m === 'choice' ? 'Elegir opción' : 'Escribir'}
        </button>
      ))}
    </div>
  );
}

function ChoiceInput({
  item,
  answered,
  choiceOrder,
  onAnswer,
}: {
  item: CodeItem;
  answered: ItemViewProps<CodeItem>['answered'];
  choiceOrder: ItemViewProps<CodeItem>['choiceOrder'];
  onAnswer: (choiceIndex: number) => void;
}) {
  const choices = item.choices!;
  const order = choiceOrder ?? choices.map((_, i) => i);
  const locked = answered !== undefined;
  const chosen =
    answered?.answer.kind === 'code' && 'choiceIndex' in answered.answer
      ? answered.answer.choiceIndex
      : undefined;

  return (
    <>
      <ul className="mt-5 space-y-2.5">
        {order.map((original, shown) => {
          const choice = choices[original]!;
          return (
            <li key={original}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onAnswer(original)}
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
              {locked && (
                <p className="prose-study mt-1.5 pr-2 pl-4 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {choice.why}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {locked && (
        <div className="mt-6 rounded-lg border-l-3 border-blue-500 bg-blue-50/50 p-4 dark:bg-blue-950/25">
          <p className="text-[11px] font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
            Explicación
          </p>
          <p className="prose-study mt-1.5 text-sm text-slate-800 dark:text-slate-200">
            {item.answer}
          </p>
          <p className="prose-study mt-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            {item.why}
          </p>
        </div>
      )}
    </>
  );
}

function WriteInput({
  showAnswer,
  locked,
  draft,
  onDraft,
  onReveal,
  item,
  onSelfGrade,
}: {
  showAnswer: boolean;
  locked: boolean;
  draft: string;
  onDraft: (v: string) => void;
  onReveal: () => void;
  item: CodeItem;
  onSelfGrade: (g: SelfGrade) => void;
}) {
  return (
    <>
      {!showAnswer && (
        <div className="mt-5">
          <textarea
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            rows={3}
            placeholder="Escribí tu respuesta antes de revelarla (opcional, no se guarda)"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-950"
          />
          <Button className="mt-3" onClick={onReveal}>
            Ver la respuesta
          </Button>
        </div>
      )}

      {showAnswer && (
        <div className="mt-5 rounded-lg border-l-3 border-blue-500 bg-blue-50/50 p-4 dark:bg-blue-950/25">
          <p className="text-[11px] font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
            Respuesta
          </p>
          <p className="prose-study mt-1.5 text-sm text-slate-800 dark:text-slate-200">
            {item.answer}
          </p>
          <p className="prose-study mt-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            {item.why}
          </p>
        </div>
      )}

      {showAnswer && !locked && (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">¿Cómo te fue?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => onSelfGrade(g.value)}
                className={`cursor-pointer rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors dark:bg-slate-900 ${g.className}`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Se puntúa por autoevaluación: no ejecutamos tu texto. Sé honesto — el puntaje es para
            vos.
          </p>
        </div>
      )}
    </>
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
