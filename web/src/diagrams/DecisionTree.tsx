import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

export function DecisionTree() {
  return (
    <svg viewBox="0 0 700 332" className="h-auto w-full" role="img" aria-labelledby="tree-title">
      <title id="tree-title">
        Árbol de decisión: dependencia de datos primero, tipo de trabajo después
      </title>
      <defs>
        <ArrowMarker id="tree-arrow" color={D.line} />
      </defs>

      {/* Pregunta raiz */}
      <rect x={190} y={8} width={320} height={46} rx={10} fill="#eff6ff" stroke={D.accent} strokeWidth={1.5} />
      <text x={350} y={30} fill={D.ink} fontSize={FONT.label} fontWeight={600} textAnchor="middle">
        ¿La entrada de B depende
      </text>
      <text x={350} y={46} fill={D.ink} fontSize={FONT.label} fontWeight={600} textAnchor="middle">
        de la salida de A?
      </text>

      <path d="M350,54 L350,78 M160,78 L540,78 M160,78 L160,104 M540,78 L540,104"
        stroke={D.line} strokeWidth={1.5} fill="none" />
      <Edge x={160} label="SÍ" />
      <Edge x={540} label="NO" />

      {/* Rama SI: secuencial */}
      <rect x={70} y={104} width={180} height={70} rx={10} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text x={160} y={128} fill={D.ink} fontSize={FONT.label} fontWeight={700} textAnchor="middle">
        SECUENCIAL
      </text>
      <text x={160} y={150} fill={D.muted} fontSize={FONT.small} fontFamily="ui-monospace, monospace" textAnchor="middle">
        await A;
      </text>
      <text x={160} y={165} fill={D.muted} fontSize={FONT.small} fontFamily="ui-monospace, monospace" textAnchor="middle">
        await B;
      </text>

      {/* Rama NO: segunda pregunta */}
      <rect x={440} y={104} width={200} height={44} rx={10} fill="#eff6ff" stroke={D.accent} strokeWidth={1.5} />
      <text x={540} y={131} fill={D.ink} fontSize={FONT.label} fontWeight={600} textAnchor="middle">
        ¿Es I/O o es CPU?
      </text>

      <path d="M540,148 L540,172 M440,172 L620,172 M440,172 L440,196 M620,172 L620,196"
        stroke={D.line} strokeWidth={1.5} fill="none" />
      <Edge x={440} y={190} label="I/O" />
      <Edge x={620} y={190} label="CPU" />

      <rect x={352} y={200} width={176} height={64} rx={10} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text x={440} y={225} fill={D.ink} fontSize={FONT.label} fontWeight={700} textAnchor="middle">
        Promise.all
      </text>
      <text x={440} y={245} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        fan-out
      </text>

      <rect x={548} y={200} width={148} height={94} rx={10} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text x={622} y={223} fill={D.ink} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
        worker_threads
      </text>
      <text x={622} y={243} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        proceso aparte
      </text>
      <text x={622} y={263} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        cola de trabajo
      </text>
      <text x={622} y={283} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
        async no ayuda acá
      </text>

      <text x={350} y={322} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        Primero la dependencia de datos. Recién después, el tipo de trabajo.
      </text>
    </svg>
  );
}

function Edge({ x, y = 96, label }: { x: number; y?: number; label: string }) {
  return (
    <text x={x + 8} y={y} fill={D.muted} fontSize={FONT.small} fontWeight={600}>
      {label}
    </text>
  );
}
