import { useState } from 'react';
import { CodeBlock } from './CodeBlock.js';

/**
 * Refuerzo colapsable con codigo aplicado. Va DESPUES de la correccion: el
 * ejercicio principal sigue siendo entender el concepto; el codigo esta para
 * el que quiere ver como se traduce en la practica.
 *
 * Es un `<details>` nativo por diseno — accesibilidad y estado gratis, sin
 * managing de `open` en cada consumidor.
 */
export function CodeExampleDisclosure({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50"
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-medium text-slate-700 select-none hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
        <span className="mr-2 inline-block text-slate-400 dark:text-slate-500">
          {open ? '▾' : '▸'}
        </span>
        Ver ejemplo en código
      </summary>
      <div className="border-t border-slate-200 px-4 pt-3 pb-4 dark:border-slate-800">
        <CodeBlock code={code} />
      </div>
    </details>
  );
}
