import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const LANES = [
  { name: 'Cliente', x: 120, w: 90 },
  { name: 'Middleware', x: 265, w: 110 },
  { name: 'Auth', x: 390, w: 80 },
  { name: 'Perfil', x: 505, w: 80 },
  { name: 'Pedidos', x: 630, w: 90 },
] as const;

const TOP = 38;
const BOTTOM = 376;

export function SequenceDiagram() {
  return (
    <svg viewBox="0 0 700 386" className="h-auto w-full" role="img" aria-labelledby="seq-title">
      <title id="seq-title">
        Diagrama de secuencia: el middleware valida el token y después dispara dos llamadas en
        paralelo
      </title>
      <defs>
        <ArrowMarker id="seq-arrow" color={D.ink} />
        <ArrowMarker id="seq-arrow-muted" color={D.muted} />
      </defs>

      {/* Banda: las dos llamadas conviven en el tiempo. Es la firma del fan-out. */}
      <rect
        x={250}
        y={162}
        width={430}
        height={172}
        rx={8}
        fill={D.band}
        stroke={D.accent}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.9}
      />
      <text x={262} y={180} fill={D.accent} fontSize={FONT.tiny} fontWeight={600}>
        las dos en vuelo a la vez
      </text>

      {LANES.map((lane) => (
        <g key={lane.name}>
          <rect
            x={lane.x - lane.w / 2}
            y={8}
            width={lane.w}
            height={30}
            rx={6}
            fill={D.surface}
            stroke={D.ink}
            strokeWidth={1.2}
          />
          <text
            x={lane.x}
            y={28}
            fill={D.ink}
            fontSize={FONT.small}
            fontWeight={600}
            textAnchor="middle"
          >
            {lane.name}
          </text>
          <line
            x1={lane.x}
            y1={TOP}
            x2={lane.x}
            y2={BOTTOM}
            stroke={D.line}
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        </g>
      ))}

      <Tick y={70} label="t = 0" />
      <Tick y={142} label="t = 80 ms" />
      <Tick y={290} label="t = 280 ms" />
      <Tick y={322} label="t = 380 ms" />

      <Message y={70} from={120} to={265} label="GET /dashboard" />
      <Message y={104} from={265} to={390} label="validate token · 80 ms" />
      <Message y={134} from={390} to={265} label="userId" reply />
      <Message y={204} from={265} to={505} label="GET profile · 200 ms" />
      <Message y={232} from={265} to={630} label="GET orders · 300 ms" />
      <Message y={290} from={505} to={265} label="200" reply />
      <Message y={322} from={630} to={265} label="200" reply />
      <Message y={356} from={265} to={120} label="200 JSON" />

      <text x={350} y={396} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        Dos flechas de salida seguidas, sin respuesta en el medio: eso es un fan-out.
      </text>
    </svg>
  );
}

/** Marca de tiempo en la canaleta izquierda + guía tenue. */
function Tick({ y, label }: { y: number; label: string }) {
  return (
    <g>
      <text x={66} y={y + 4} fill={D.faint} fontSize={FONT.tiny} textAnchor="end">
        {label}
      </text>
      <line x1={72} y1={y} x2={688} y2={y} stroke={D.grid} strokeWidth={1} />
    </g>
  );
}

/** Una flecha entre dos lifelines. Las respuestas van punteadas, como en UML. */
function Message({
  y,
  from,
  to,
  label,
  reply = false,
}: {
  y: number;
  from: number;
  to: number;
  label: string;
  reply?: boolean;
}) {
  const midpoint = (from + to) / 2;
  return (
    <g>
      <line
        x1={from}
        y1={y}
        x2={to}
        y2={y}
        stroke={reply ? D.muted : D.ink}
        strokeWidth={reply ? 1.2 : 1.6}
        strokeDasharray={reply ? '5 4' : undefined}
        markerEnd={`url(#${reply ? 'seq-arrow-muted' : 'seq-arrow'})`}
      />
      <text
        x={midpoint}
        y={y - 7}
        fill={reply ? D.muted : D.ink}
        fontSize={FONT.tiny}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}
