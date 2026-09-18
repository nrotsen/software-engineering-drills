import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isScorable } from '@core/domain/item';
import type { Level, LevelNumber, Section, SectionId } from '@core/domain/section';
import type { LevelResult } from '@core/domain/progress';
import { useSection } from '../hooks/useSection.js';
import { useLevelSession } from '../session/useLevelSession.js';
import { ItemView } from '../items/ItemView.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { ScoreBadge } from '../components/ScoreBadge.js';
import { Button } from '../components/Button.js';
import { LevelSummary } from '../components/LevelSummary.js';
import { isSectionId, toLevelNumber } from '../lib/params.js';

export function LevelPage({ onFinish }: { onFinish: (result: LevelResult) => void }) {
  const { sectionId, level } = useParams();
  const levelNumber = toLevelNumber(level);
  const state = useSection(isSectionId(sectionId) ? sectionId : 'concurrency');

  if (!isSectionId(sectionId) || levelNumber === undefined) return <NotFound />;
  if (state.status === 'loading')
    return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>;
  if (state.status === 'error')
    return <p className="text-rose-600 dark:text-rose-400">{state.message}</p>;

  const found = state.section.levels.find((l) => l.level === levelNumber);
  if (!found) return <NotFound />;

  // `key` fuerza a React a desmontar y remontar cuando cambia el nivel: asi la
  // sesion (y su orden barajado) se reinicia sola, sin un useEffect que
  // sincronice estado a mano. Es la forma idiomatica de decir "esto es otra
  // instancia del mismo componente".
  return (
    <LevelRunner
      key={`${sectionId}-${levelNumber}`}
      section={state.section}
      level={found}
      onFinish={onFinish}
    />
  );
}

function LevelRunner({
  section,
  level,
  onFinish,
}: {
  section: Section;
  level: Level;
  onFinish: (result: LevelResult) => void;
}) {
  const [runId, setRunId] = useState(0);
  const session = useLevelSession(level);
  const { state, item, score, answered } = session;

  // Guardamos UNA sola vez, al terminar. Igual que la CLI, que persiste al
  // cerrar el nivel: la unidad de trabajo es el nivel, no el item.
  const recorded = useRef(false);
  useEffect(() => {
    if (!state.finished || recorded.current) return;
    recorded.current = true;
    onFinish({
      sectionId: section.id,
      level: level.level,
      earned: score.earned,
      possible: score.possible,
      completedAt: new Date().toISOString(),
    });
  }, [state.finished, score, section.id, level.level, onFinish]);

  if (state.finished) {
    return (
      <LevelSummary
        section={section}
        level={level}
        score={score}
        onRestart={() => setRunId((n) => n + 1)}
      />
    );
  }

  const scorables = level.items.filter(isScorable).length;
  const answeredCount = Object.keys(state.answers).length;

  return (
    <div key={runId}>
      <div className="mb-6">
        <Link
          to={`/seccion/${section.id}`}
          className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← {section.title}
        </Link>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Nivel {level.level} · {level.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>
              {answeredCount}/{scorables} respondidas
            </span>
            {answeredCount > 0 && <ScoreBadge score={score} />}
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={state.index} total={state.items.length} />
        </div>
      </div>

      <ItemView
        item={item}
        answered={answered}
        choiceOrder={state.choiceOrder[item.id]}
        onAnswer={(a) => isScorable(item) && session.answer(item, a)}
      />

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={session.back} disabled={state.index === 0}>
          ← Anterior
        </Button>
        <Button onClick={session.next} disabled={!session.canAdvance}>
          {state.index === state.items.length - 1 ? 'Ver resumen' : 'Siguiente →'}
        </Button>
      </div>

      {!session.canAdvance && (
        <p className="mt-3 text-right text-xs text-slate-400 dark:text-slate-500">
          Respondé para poder avanzar
        </p>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <p className="text-slate-600 dark:text-slate-300">
      No existe ese nivel.{' '}
      <Link to="/" className="text-blue-600 underline dark:text-blue-400">
        Volver
      </Link>
    </p>
  );
}
