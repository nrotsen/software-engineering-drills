import { Link, useParams } from 'react-router-dom';
import type { LevelNumber, SectionId } from '@core/domain/section';
import { levelKey } from '@core/domain/section';
import type { ProgressState } from '@core/domain/progress';
import { useSection } from '../hooks/useSection.js';
import { Card } from '../components/Card.js';
import { ScoreBadge } from '../components/ScoreBadge.js';
import { isSectionId } from '../lib/params.js';

type MainLevel = Exclude<LevelNumber, 0>;
const LEVELS: readonly MainLevel[] = [1, 2, 3];
const HINTS: Record<MainLevel, string> = {
  1: 'fundamentos',
  2: 'aplicación',
  3: 'criterio y trade-offs',
};

export function SectionPage({ progress }: { progress: ProgressState }) {
  const { sectionId } = useParams();
  if (!isSectionId(sectionId)) return <NotFound />;
  return <SectionBody id={sectionId} progress={progress} />;
}

function SectionBody({ id, progress }: { id: SectionId; progress: ProgressState }) {
  const state = useSection(id);

  if (state.status === 'loading')
    return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>;
  if (state.status === 'error')
    return <p className="text-rose-600 dark:text-rose-400">{state.message}</p>;

  const { section } = state;

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        ← Todas las secciones
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {section.title}
      </h1>
      <p className="mt-1.5 max-w-2xl text-slate-600 dark:text-slate-300">{section.blurb}</p>

      {(() => {
        const intro = section.levels.find((l) => l.level === 0);
        if (!intro) return null;
        const prev = progress.results[levelKey(id, 0)];
        return (
          <div className="mt-8">
            <Link to={`/seccion/${id}/nivel/0`} className="group">
              <Card className="border-dashed p-5 transition-shadow group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-500/60">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300">
                    Intro
                  </span>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{intro.title}</h2>
                  {prev && <ScoreBadge score={prev} />}
                </div>
                <p className="prose-study mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {intro.goal}
                </p>
              </Card>
            </Link>
          </div>
        );
      })()}

      <ul className="mt-4 space-y-3">
        {LEVELS.map((n) => {
          const level = section.levels.find((l) => l.level === n);
          const prev = progress.results[levelKey(id, n)];

          if (!level) {
            return (
              <li key={n}>
                <Card className="p-5 opacity-60">
                  <p className="font-medium text-slate-600 dark:text-slate-400">
                    Nivel {n} · {HINTS[n]}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">en construcción</p>
                </Card>
              </li>
            );
          }

          return (
            <li key={n}>
              <Link to={`/seccion/${id}/nivel/${n}`} className="group">
                <Card className="p-5 transition-shadow group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-500/60">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                      Nivel {n}
                    </span>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                      {level.title}
                    </h2>
                    {prev && <ScoreBadge score={prev} />}
                  </div>
                  <p className="prose-study mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {level.goal}
                  </p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NotFound() {
  return (
    <p className="text-slate-600 dark:text-slate-300">
      No existe esa sección.{' '}
      <Link to="/" className="text-blue-600 underline dark:text-blue-400">
        Volver
      </Link>
    </p>
  );
}
