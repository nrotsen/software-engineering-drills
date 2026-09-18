import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${className}`}
    >
      {children}
    </div>
  );
}

/** Etiqueta del tipo de item. Da orientación antes de leer: "esto es teoría". */
export function KindBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  } as const;
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
