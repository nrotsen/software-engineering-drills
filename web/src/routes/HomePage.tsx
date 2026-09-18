import { Link } from 'react-router-dom';
import { registry, SECTION_ORDER } from '@core/content/registry';
import { levelKey, type LevelNumber, type SectionId } from '@core/domain/section';
import type { ProgressState } from '@core/domain/progress';
import { Card } from '../components/Card.js';
import { ProgressBar } from '../components/ProgressBar.js';

const LEVELS: readonly LevelNumber[] = [1, 2, 3];

export function HomePage({ progress }: { progress: ProgressState }) {
  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Guía interactiva
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-300">
          Conceptos de ingeniería de software para practicar, no para leer. Teoría corta, preguntas
          con explicación, diagramas y cálculos.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTION_ORDER.map((id) => (
          <SectionCard key={id} id={id} progress={progress} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ id, progress }: { id: SectionId; progress: ProgressState }) {
  const entry = registry[id];
  const done = LEVELS.filter((n) => progress.results[levelKey(id, n)]).length;

  if (entry.status === 'pending') {
    return (
      <Card className="p-5 opacity-60">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-slate-600 dark:text-slate-400">{entry.title}</h2>
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {entry.note}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{entry.blurb}</p>
      </Card>
    );
  }

  return (
    <Link to={`/seccion/${id}`} className="group">
      <Card className="h-full p-5 transition-shadow group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-500/60">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h2>
          <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
            {done}/3 niveles
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{entry.blurb}</p>
        <div className="mt-4">
          <ProgressBar value={done} total={LEVELS.length} />
        </div>
      </Card>
    </Link>
  );
}
