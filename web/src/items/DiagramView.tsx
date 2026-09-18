import type { DiagramItem } from '@core/domain/item';
import { Card, KindBadge } from '../components/Card.js';
import { diagramFor } from '../diagrams/index.js';
import type { ItemViewProps } from './types.js';

export function DiagramView({ item }: ItemViewProps<DiagramItem>) {
  const Diagram = diagramFor(item.id);

  return (
    // El "bleed" (-mx en pantallas anchas) saca la card del ancho de lectura.
    // La medida corta (~68ch) es correcta para TEXTO, pero asfixia a un dibujo:
    // el diagrama de secuencia tiene tipografía de 10 unidades sobre un viewBox
    // de 700, así que a 500px de ancho renderiza a ~7px reales. Ilegible.
    // Los diagramas piden ancho; el texto, no. Dos necesidades distintas.
    <Card className="p-6 sm:p-8 xl:-mx-32 2xl:-mx-44">
      <KindBadge label="Diagrama" />
      <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h2>

      {/* Dibujo y explicacion lado a lado en desktop, apilados en mobile: el
          texto explica el dibujo, asi que hay que poder verlos a la vez. */}
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
          {/* min-width: antes de encoger por debajo de lo legible, que scrollee.
              Los SVGs de los diagramas estan pensados en tinta oscura sobre
              fondo blanco: los invertimos con un filtro CSS en dark, en vez de
              reescribir cada uno. Sale barato y queda coherente. */}
          {Diagram ? (
            <div className="min-w-[560px] dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.95)_contrast(0.95)]">
              <Diagram />
            </div>
          ) : (
            // Fallback: si un diagrama todavia no tiene componente SVG, se
            // muestra el ASCII del contenido. La app nunca se rompe por eso.
            <pre className="overflow-x-auto font-mono text-[11px] leading-tight text-slate-600 dark:text-slate-300">
              {item.ascii.trim()}
            </pre>
          )}
        </div>
        <p className="prose-study text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {item.caption}
        </p>
      </div>
    </Card>
  );
}
