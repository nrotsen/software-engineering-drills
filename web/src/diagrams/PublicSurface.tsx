import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** a1-d1 · Abstracción (arriba de la línea) y encapsulamiento (abajo). */
export function PublicSurface() {
  return (
    <svg viewBox="0 0 700 344" className="h-auto w-full" role="img" aria-labelledby="surface-title">
      <title id="surface-title">
        Una clase dividida en superficie pública e interior privado: la abstracción decide qué se
        expone, el encapsulamiento protege lo que no
      </title>
      <defs>
        <ArrowMarker id="surface-arrow" color={D.ink} />
      </defs>

      <text x={290} y={18} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        el que te usa
      </text>
      <path
        d="M290,26 L290,66"
        stroke={D.ink}
        strokeWidth={1.6}
        markerEnd="url(#surface-arrow)"
        fill="none"
      />
      <text x={300} y={52} fill={D.faint} fontSize={FONT.tiny}>
        sólo puede llamar a esto
      </text>

      {/* Interior: fondo distinto para que la división se vea antes de leer */}
      <rect x={120} y={146} width={340} height={118} fill={D.band} />
      <rect
        x={120}
        y={74}
        width={340}
        height={190}
        rx={10}
        fill="none"
        stroke={D.ink}
        strokeWidth={1.5}
      />
      <line x1={120} y1={146} x2={460} y2={146} stroke={D.accent} strokeWidth={2} strokeDasharray="6 4" />

      <text x={144} y={106} fill={D.ink} fontSize={FONT.small} fontFamily={MONO}>
        add(product, qty)
      </text>
      <text x={144} y={130} fill={D.ink} fontSize={FONT.small} fontFamily={MONO}>
        get total()
      </text>

      <text x={144} y={176} fill={D.muted} fontSize={FONT.small} fontFamily={MONO}>
        #items = []
      </text>
      <text x={144} y={200} fill={D.muted} fontSize={FONT.small} fontFamily={MONO}>
        #mergeLines()
      </text>
      <text x={144} y={224} fill={D.muted} fontSize={FONT.small} fontFamily={MONO}>
        #applyDiscounts()
      </text>

      <text x={484} y={100} fill={D.accent} fontSize={FONT.small} fontWeight={700}>
        ABSTRACCIÓN
      </text>
      <text x={484} y={118} fill={D.muted} fontSize={FONT.tiny}>
        qué concepto exponés
      </text>
      <text x={484} y={136} fill={D.faint} fontSize={FONT.tiny}>
        cada método de acá arriba
      </text>
      <text x={484} y={150} fill={D.faint} fontSize={FONT.tiny}>
        es deuda futura
      </text>

      <text x={484} y={196} fill={D.ink} fontSize={FONT.small} fontWeight={700}>
        ENCAPSULAMIENTO
      </text>
      <text x={484} y={214} fill={D.muted} fontSize={FONT.tiny}>
        cómo protegés lo que
      </text>
      <text x={484} y={228} fill={D.muted} fontSize={FONT.tiny}>
        no exponés
      </text>

      <text x={120} y={298} fill={D.muted} fontSize={FONT.small}>
        cambiar el interior
      </text>
      <text x={300} y={298} fill={D.ink} fontSize={FONT.small} fontWeight={600}>
        → nadie se entera
      </text>
      <text x={120} y={322} fill={D.muted} fontSize={FONT.small}>
        cambiar la superficie
      </text>
      <text x={300} y={322} fill={D.taskC} fontSize={FONT.small} fontWeight={600}>
        → rompés a todos tus usuarios
      </text>
    </svg>
  );
}
