import type { ReactNode } from 'react';

/**
 * Bloque de correccion: veredicto + explicacion. Un solo componente para
 * verdadero/falso y numericos, para que el feedback se vea IGUAL en los dos.
 * La consistencia importa: si cada tipo de item corrigiera con otro layout,
 * cada respuesta te obligaria a reorientarte antes de leer.
 */
export function Verdict({
  correct,
  why,
  children,
}: {
  correct: boolean;
  why: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`mt-5 rounded-lg border-l-3 p-4 ${
        correct
          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/25'
          : 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/25'
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          correct
            ? 'text-emerald-800 dark:text-emerald-300'
            : 'text-rose-800 dark:text-rose-300'
        }`}
      >
        {correct ? '✔ Correcto' : '✘ Incorrecto'}
      </p>
      {children && <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{children}</p>}
      <p className="prose-study mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
        {why}
      </p>
    </div>
  );
}
