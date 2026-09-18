import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

/** b1-d2 · Arquitectura: qué piezas hay, dónde vive el dato, qué se cae. */
export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 700 424" className="h-auto w-full" role="img" aria-labelledby="arch-title">
      <title id="arch-title">
        Diagrama de arquitectura: clientes, gateway, tres servicios con sus almacenes, y un worker
        detrás de una cola
      </title>
      <defs>
        <ArrowMarker id="arch-arrow" color={D.line} />
        <ArrowMarker id="arch-arrow-ink" color={D.ink} />
      </defs>

      <Box x={20} y={16} w={120} h={38} title="Web SPA" />
      <Box x={20} y={64} w={120} h={38} title="Mobile" />
      <line x1={140} y1={35} x2={224} y2={45} stroke={D.line} strokeWidth={1.5} markerEnd="url(#arch-arrow)" />
      <line x1={140} y1={83} x2={224} y2={72} stroke={D.line} strokeWidth={1.5} markerEnd="url(#arch-arrow)" />

      <Box x={230} y={16} w={210} h={86} title="API Gateway" sub="auth · rate limit · routing" />

      <path d="M335,102 L335,126 M110,126 L560,126 M110,126 L110,148 M335,126 L335,148 M560,126 L560,148"
        stroke={D.line} strokeWidth={1.5} fill="none" />

      <Box x={25} y={150} w={170} h={44} title="Orders Service" />
      <Box x={250} y={150} w={170} h={44} title="Users Service" />
      <Box x={475} y={150} w={170} h={44} title="Payments Service" />

      <Down x={110} from={194} to={222} />
      <Down x={335} from={194} to={222} />
      <Down x={560} from={194} to={222} />

      <Store x={25} y={226} w={170} title="Postgres" sub="orders" />
      <Store x={250} y={226} w={170} title="Postgres" sub="users" />
      <Store x={475} y={226} w={170} title="Stripe API" sub="externo" external />

      <Down x={110} from={278} to={306} />
      <Box x={25} y={310} w={170} h={48} title="Cola (SQS)" sub="order.placed" />
      <line x1={195} y1={334} x2={252} y2={334} stroke={D.ink} strokeWidth={1.5} markerEnd="url(#arch-arrow-ink)" />
      <Box x={258} y={310} w={190} h={48} title="Worker" sub="facturación" />

      <text x={25} y={392} fill={D.faint} fontSize={FONT.tiny}>
        Cada servicio con su propio almacén: nadie lee la base del otro.
      </text>
      <text x={25} y={410} fill={D.faint} fontSize={FONT.tiny}>
        Borde punteado = sistema externo, fuera de tu control.
      </text>
    </svg>
  );
}

function Down({ x, from, to }: { x: number; from: number; to: number }) {
  return (
    <line x1={x} y1={from} x2={x} y2={to} stroke={D.line} strokeWidth={1.5} markerEnd="url(#arch-arrow)" />
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={D.surface} stroke={D.ink} strokeWidth={1.4} />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 2 : y + h / 2 + 5}
        fill={D.ink}
        fontSize={FONT.small}
        fontWeight={600}
        textAnchor="middle"
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 16} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}

/** Almacenes en otro tono: dónde vive el dato se lee antes que el nombre. */
function Store({
  x,
  y,
  w,
  title,
  sub,
  external,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  sub: string;
  external?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={44}
        rx={8}
        fill={D.band}
        stroke={external ? D.faint : D.muted}
        strokeWidth={1.4}
        strokeDasharray={external ? '5 4' : undefined}
      />
      <text x={x + w / 2} y={y + 20} fill={D.ink} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
        {title}
      </text>
      <text x={x + w / 2} y={y + 35} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
}
