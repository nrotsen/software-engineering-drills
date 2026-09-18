import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ConfirmDialog } from './components/ConfirmDialog.js';
import { MouseAurora } from './components/MouseAurora.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { useProgress } from './hooks/useProgress.js';
import { useTheme } from './hooks/useTheme.js';
import { HomePage } from './routes/HomePage.js';
import { SectionPage } from './routes/SectionPage.js';
import { LevelPage } from './routes/LevelPage.js';
import { PreviewPage } from './routes/PreviewPage.js';

export function App() {
  const { progress, record, reset } = useProgress();
  const { theme, toggle: toggleTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen">
      <MouseAurora />
      <nav className="relative z-10 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Guía interactiva
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="cursor-pointer text-xs text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
            >
              Reiniciar progreso
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </nav>

      <ConfirmDialog
        open={confirmReset}
        title="¿Reiniciar tu progreso?"
        description="Se borrarán todos los resultados guardados en este navegador. Esta acción no se puede deshacer."
        confirmLabel="Reiniciar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void reset();
        }}
      />

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <Routes>
          <Route path="/" element={<HomePage progress={progress} />} />
          <Route path="/seccion/:sectionId" element={<SectionPage progress={progress} />} />
          <Route
            path="/seccion/:sectionId/nivel/:level"
            element={<LevelPage onFinish={(r) => void record(r)} />}
          />
          {/* Herramienta de desarrollo: no se monta en el build de producción. */}
          {import.meta.env.DEV && (
            <Route path="/preview/:sectionId/:level" element={<PreviewPage />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
