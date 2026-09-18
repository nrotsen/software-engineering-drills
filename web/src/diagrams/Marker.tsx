import { D } from './palette.js';

/**
 * Los markers de SVG se referencian por id, y los ids son GLOBALES al
 * documento. Si dos diagramas definieran `id="arrow"`, el segundo pisaria al
 * primero y las flechas cambiarian de color solas. Por eso cada diagrama pasa
 * su propio prefijo.
 */
export function ArrowMarker({ id, color = D.ink }: { id: string; color?: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
    >
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  );
}
