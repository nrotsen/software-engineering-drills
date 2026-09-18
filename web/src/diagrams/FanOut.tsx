import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

interface Branch {
  readonly label: string;
  readonly ms: number;
  readonly cx: number;
  readonly color: string;
  /** La rama mas lenta: es la que define la latencia total del fan-out. */
  readonly critical?: boolean;
}

const BRANCHES: readonly Branch[] = [
  { label: 'perfil', ms: 200, cx: 110, color: D.taskA },
  { label: 'pedidos', ms: 300, cx: 320, color: D.taskB, critical: true },
  { label: 'notifs', ms: 150, cx: 530, color: D.taskC },
];

const CX = 320;

export function FanOut() {
  return (
    <svg viewBox="0 0 640 372" className="h-auto w-full" role="img" aria-labelledby="fanout-title">
      <title id="fanout-title">
        Fan-out: un handler dispara tres llamadas en paralelo y espera a todas (fan-in)
      </title>
      <defs>
        <ArrowMarker id="fanout-arrow" color={D.line} />
        <ArrowMarker id="fanout-arrow-ink" color={D.ink} />
      </defs>

      <Box x={CX - 70} y={10} w={140} h={40} label="handler" />

      {/* fan-out: del handler salen tres ramas independientes */}
      <path d={`M${CX},50 L${CX},76`} stroke={D.line} strokeWidth={1.5} fill="none" />
      <path d="M110,76 L530,76" stroke={D.line} strokeWidth={1.5} fill="none" />
      <text x={CX + 12} y={70} fill={D.accent} fontSize={FONT.small} fontWeight={600}>
        fan-out · Promise.all
      </text>

      {BRANCHES.map((b) => (
        <g key={b.label}>
          <path
            d={`M${b.cx},76 L${b.cx},106`}
            stroke={b.critical ? D.ink : D.line}
            strokeWidth={b.critical ? 2 : 1.5}
            markerEnd={`url(#${b.critical ? 'fanout-arrow-ink' : 'fanout-arrow'})`}
            fill="none"
          />
          <rect
            x={b.cx - 75}
            y={112}
            width={150}
            height={64}
            rx={8}
            fill={D.surface}
            stroke={b.critical ? D.ink : D.line}
            strokeWidth={b.critical ? 1.8 : 1.2}
          />
          <rect x={b.cx - 75} y={112} width={5} height={64} rx={2} fill={b.color} />
          <text x={b.cx} y={139} fill={D.ink} fontSize={FONT.label} fontWeight={600} textAnchor="middle">
            {b.label}
          </text>
          <text x={b.cx} y={159} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
            {b.ms} ms
          </text>
          <path
            d={`M${b.cx},176 L${b.cx},214`}
            stroke={b.critical ? D.ink : D.line}
            strokeWidth={b.critical ? 2 : 1.5}
            fill="none"
          />
        </g>
      ))}

      {/* fan-in: se espera a TODAS antes de seguir */}
      <path d="M110,214 L530,214" stroke={D.line} strokeWidth={1.5} fill="none" />
      <path
        d={`M${CX},214 L${CX},250`}
        stroke={D.ink}
        strokeWidth={2}
        markerEnd="url(#fanout-arrow-ink)"
        fill="none"
      />
      <text x={CX + 12} y={234} fill={D.accent} fontSize={FONT.small} fontWeight={600}>
        fan-in · esperar a todas
      </text>

      <Box x={CX - 70} y={256} w={140} h={40} label="respuesta" />

      <text x={CX} y={324} fill={D.ink} fontSize={FONT.label} textAnchor="middle">
        total = max(200, 300, 150) ={' '}
        <tspan fontWeight={700}>300 ms</tspan>
      </text>
      <text x={CX} y={344} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
        secuencial serían 650 ms · el ancho del fan-out es la carga simultánea al downstream
      </text>
    </svg>
  );
}

function Box({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text
        x={x + w / 2}
        y={y + h / 2 + 5}
        fill={D.ink}
        fontSize={FONT.label}
        fontWeight={600}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}
