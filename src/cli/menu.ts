import type { LevelNumber, Section, SectionId } from '../core/domain/section.js';
import { levelKey } from '../core/domain/section.js';
import type { ProgressState } from '../core/domain/progress.js';
import { loadSection, registry, SECTION_ORDER } from '../core/content/registry.js';
import type { ProgressStore } from '../core/progress-store.js';
import { runLevel } from './run-level.js';
import type { HandlerCtx } from './handlers/index.js';
import { formatPoints } from '../core/scoring.js';
import { theme, icons } from './theme.js';
import { rule, wrap } from './layout.js';
import type { Io } from './io.js';

type MainLevel = Exclude<LevelNumber, 0>;
const LEVELS: readonly MainLevel[] = [1, 2, 3];
const LEVEL_HINT: Record<MainLevel, string> = {
  1: 'fundamentos',
  2: 'aplicación',
  3: 'criterio y trade-offs',
};

export interface AppDeps {
  readonly io: Io;
  readonly store: ProgressStore;
  readonly shuffle: HandlerCtx['shuffle'];
}

export async function runApp(deps: AppDeps): Promise<void> {
  const { io } = deps;
  for (;;) {
    const progress = await deps.store.load();
    banner(io, progress);

    const picked = await io.select<SectionId | 'reset' | 'quit'>('¿Qué querés practicar?', [
      ...SECTION_ORDER.map((id) => sectionChoice(id, progress)),
      { name: theme.dim('— Reiniciar mi progreso'), value: 'reset' as const },
      { name: theme.dim('— Salir'), value: 'quit' as const },
    ]);

    if (picked === 'quit') {
      io.print();
      io.print(theme.dim('Hasta la próxima. Tu progreso quedó guardado.'));
      return;
    }
    if (picked === 'reset') {
      const sure = await io.select<boolean>('¿Seguro? Se borra todo el progreso.', [
        { name: 'No, volver', value: false },
        { name: 'Sí, borrar', value: true },
      ]);
      if (sure) await deps.store.reset();
      continue;
    }

    const section = await loadSection(picked);
    await sectionMenu(section, deps);
  }
}

async function sectionMenu(section: Section, deps: AppDeps): Promise<void> {
  const { io } = deps;
  for (;;) {
    const progress = await deps.store.load();

    io.clear();
    io.print(theme.dim(rule('═')));
    io.print(theme.title(section.title));
    io.print(theme.dim(wrap(section.blurb, 78)));
    io.print(theme.dim(rule('═')));
    io.print();

    const intro = section.levels.find((l) => l.level === 0);
    const picked = await io.select<LevelNumber | 'back'>('Elegí un nivel', [
      ...(intro ? [introChoice(section, progress)] : []),
      ...LEVELS.map((n) => levelChoice(section, n, progress)),
      { name: theme.dim('— Volver'), value: 'back' as const },
    ]);
    if (picked === 'back') return;

    const level = section.levels.find((l) => l.level === picked);
    if (!level) continue; // deshabilitado en el menu; defensa por las dudas

    const result = await runLevel(section, level, { io: deps.io, shuffle: deps.shuffle });
    await deps.store.record(result);
    await io.pause('Enter para volver al menú');
  }
}

function sectionChoice(id: SectionId, progress: ProgressState) {
  const entry = registry[id];
  const done = LEVELS.filter((n) => progress.results[levelKey(id, n)]).length;
  const mark = done === 0 ? theme.dim(icons.lock) : theme.ok(`${icons.done} ${done}/3`);

  if (entry.status === 'pending') {
    return {
      name: `${entry.title}`,
      value: id,
      description: entry.blurb,
      disabled: `(${entry.note})`,
    };
  }
  return { name: `${entry.title}  ${mark}`, value: id, description: entry.blurb };
}

function levelChoice(section: Section, n: MainLevel, progress: ProgressState) {
  const level = section.levels.find((l) => l.level === n);
  if (!level) {
    return {
      name: `Nivel ${n} — ${LEVEL_HINT[n]}`,
      value: n,
      disabled: '(en construcción)',
    };
  }
  const prev = progress.results[levelKey(section.id, n)];
  const badge = prev
    ? theme.ok(`  ${icons.done} ${formatPoints(prev.earned)}/${formatPoints(prev.possible)}`)
    : theme.dim(`  ${icons.lock} sin hacer`);
  return {
    name: `Nivel ${n} — ${level.title}${badge}`,
    value: n,
    description: level.goal,
  };
}

function introChoice(section: Section, progress: ProgressState) {
  const level = section.levels.find((l) => l.level === 0)!;
  const prev = progress.results[levelKey(section.id, 0)];
  const badge = prev
    ? theme.ok(`  ${icons.done} ${formatPoints(prev.earned)}/${formatPoints(prev.possible)}`)
    : theme.dim(`  ${icons.lock} sin hacer`);
  return {
    name: `Intro — ${level.title}${badge}`,
    value: 0 as LevelNumber,
    description: level.goal,
  };
}

function banner(io: Io, progress: ProgressState): void {
  const total = Object.keys(progress.results).length;
  io.clear();
  io.print(
    theme.title(`
  ┌────────────────────────────────────────────────────┐
  │   GUÍA INTERACTIVA · ingeniería de software        │
  │   practicar > leer                                 │
  └────────────────────────────────────────────────────┘`),
  );
  io.print(theme.dim(`  Niveles completados: ${total}`));
  io.print();
}
