import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const CX = 250;

/** b1-d1 · Flujo: la complejidad está en las decisiones (los rombos). */
export function FlowDiagram() {
  return (
    <svg viewBox="0 0 640 486" className="h-auto w-full" role="img" aria-labelledby="flow-title">
      <title id="flow-title">
        Diagrama de flujo del alta de un pago, con dos decisiones y tres salidas posibles
      </title>
      <defs>
        <ArrowMarker id="flow-arrow" color={D.ink} />
        <ArrowMarker id="flow-arrow-warn" color={D.taskC} />
      </defs>

      <Pill x={CX - 80} y={10} w={160} label="POST /payments" />
      <Down from={46} to={64} />

      <Step x={CX - 80} y={64} w={160} label="validar input" />
      <Down from={100} to={116} />

      <Decision cy={160} line1="¿monto" line2="válido?" />
      <Branch y={160} label="no" />
      <Pill x={440} y={142} w={150} label="400 inválido" tone="warn" />

      <Down from={204} to={234} />
      <Decision cy={278} line1="¿tarjeta" line2="autoriza?" />
      <Branch y={278} label="no" />
      <Step x={440} y={254} w={150} label="402 rechazado" sub="+ notificar al usuario" tone="warn" />

      <Down from={322} to={352} label="sí" />
      <Step x={CX - 90} y={352} w={180} label="guardar pago" sub="estado = paid" />
      <Down from={404} to={430} />
      <Pill x={CX - 80} y={430} w={160} label="201 creado" tone="ok" />

      <text x={190} y={214} fill={D.muted} fontSize={FONT.tiny}>
        sí
      </text>
    </svg>
  );
}

function Down({ from, to, label }: { from: number; to: number; label?: string }) {
  return (
    <g>
      <line x1={CX} y1={from} x2={CX} y2={to} stroke={D.ink} strokeWidth={1.5} markerEnd="url(#flow-arrow)" />
      {label && (
        <text x={CX - 20} y={(from + to) / 2 + 4} fill={D.muted} fontSize={FONT.tiny}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Rama de salida: sale por el vértice derecho del rombo. */
function Branch({ y, label }: { y: number; label: string }) {
  return (
    <g>
      <line x1={CX + 62} y1={y} x2={434} y2={y} stroke={D.taskC} strokeWidth={1.5} markerEnd="url(#flow-arrow-warn)" />
      <text x={340} y={y - 8} fill={D.taskC} fontSize={FONT.tiny} fontWeight={700} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Decision({ cy, line1, line2 }: { cy: number; line1: string; line2: string }) {
  return (
    <g>
      <path
        d={`M${CX},${cy - 44} L${CX + 62},${cy} L${CX},${cy + 44} L${CX - 62},${cy} Z`}
        fill="#eff6ff"
        stroke={D.accent}
        strokeWidth={1.5}
      />
      <text x={CX} y={cy - 2} fill={D.ink} fontSize={FONT.tiny} fontWeight={600} textAnchor="middle">
        {line1}
      </text>
      <text x={CX} y={cy + 14} fill={D.ink} fontSize={FONT.tiny} fontWeight={600} textAnchor="middle">
        {line2}
      </text>
    </g>
  );
}

function Pill({
  x,
  y,
  w,
  label,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  tone?: 'ok' | 'warn';
}) {
  const stroke = tone === 'warn' ? D.taskC : tone === 'ok' ? D.accent : D.ink;
  return (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={18} fill={D.surface} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 23} fill={D.ink} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Step({
  x,
  y,
  w,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  sub?: string;
  tone?: 'warn';
}) {
  const stroke = tone === 'warn' ? D.taskC : D.ink;
  const h = sub ? 52 : 36;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={D.surface} stroke={stroke} strokeWidth={1.5} />
      <text
        x={x + w / 2}
        y={sub ? y + 21 : y + 23}
        fill={D.ink}
        fontSize={FONT.small}
        fontWeight={600}
        textAnchor="middle"
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 38} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}
