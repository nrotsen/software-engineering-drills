import { useEffect, useId } from 'react';
import { Button } from './Button.js';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Si es `true`, el botón de confirmar usa el acento rose (acción destructiva). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  // ESC cierra + bloqueo de scroll del body mientras el diálogo está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass = destructive
    ? 'bg-rose-600 text-white hover:bg-rose-700'
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 dark:bg-black/60"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button autoFocus variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" className={confirmClass} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
