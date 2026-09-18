import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const LANES = [
  { name: 'Cliente', x: 120, w: 92 },
  { name: 'Middleware', x: 250, w: 112 },
  { name: 'Auth', x: 370, w: 80 },
  { name: 'Permisos', x: 490, w: 100 },
  { name: 'Perfil', x: 610, w: 88 },
  { name: 'Facturación', x: 730, w: 112 },
] as const;

const TOP = 38;
const BOTTOM = 462;

/** b2-d1 · El endpoint de la Sección C, con fragmentos par y alt. */
export function SequenceWithFragments() {
  return (
    <svg viewBox="0 0 800 476" className="h-auto w-full" role="img" aria-labelledby="seqf-title">
      <title id="seqf-title">
        Diagrama de secuencia del dashboard con un fragmento par para las llamadas concurrentes y un
        fragmento alt para los dos finales posibles
      </title>
      <defs>
        <ArrowMarker id="seqf-arrow" color={D.ink} />
        <ArrowMarker id="seqf-arrow-muted" color={D.muted} />
      </defs>

      <Fragment x={210} y={150} w={575} h={158} label="par" note="ocurren a la vez" />
      <Fragment x={78} y={382} w={707} h={82} label="alt" />

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
          <text x={lane.x} y={28} fill={D.ink} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
            {lane.name}
          </text>
          <line x1={lane.x} y1={TOP} x2={lane.x} y2={BOTTOM} stroke={D.line} strokeWidth={1} strokeDasharray="3 4" />
        </g>
      ))}

      <Tick y={70} label="t = 0" />
      <Tick y={136} label="t = 80 ms" />
      <Tick y={288} label="t = 280 ms" />
      <Tick y={368} label="t = 430 ms" />

      <Msg y={70} from={120} to={250} label="GET /dashboard" />
      <Msg y={100} from={250} to={370} label="verify JWT · 80 ms" />
      <Msg y={126} from={370} to={250} label="userId" reply />

      <Msg y={192} from={250} to={490} label="GET permisos · 120 ms" />
      <Msg y={220} from={250} to={610} label="GET perfil · 200 ms" />
      <Msg y={258} from={490} to={250} label="200" reply />
      <Msg y={288} from={610} to={250} label="200" reply />

      <Msg y={340} from={250} to={730} label="POST cargo · 150 ms" />
      <Msg y={368} from={730} to={250} label="200" reply />

      <Msg y={412} from={250} to={120} label="[ok] 200 JSON" />
      <line x1={78} y1={426} x2={785} y2={426} stroke={D.accent} strokeWidth={1} strokeDasharray="5 4" />
      <Msg y={454} from={250} to={120} label="[sin permiso] 403" />
    </svg>
  );
}

/** Recuadro de fragmento con su etiqueta en la esquina, como en UML. */
function Fragment({
  x,
  y,
  w,
  h,
  label,
  note,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={D.band} stroke={D.accent} strokeWidth={1} opacity={0.95} />
      <path d={`M${x},${y} L${x + 44},${y} L${x + 44},${y + 14} L${x + 36},${y + 20} L${x},${y + 20} Z`} fill={D.accent} />
      <text x={x + 8} y={y + 15} fill="#ffffff" fontSize={FONT.tiny} fontWeight={700}>
        {label}
      </text>
      {note && (
        <text x={x + 54} y={y + 15} fill={D.accent} fontSize={FONT.tiny}>
          {note}
        </text>
      )}
    </g>
  );
}

function Tick({ y, label }: { y: number; label: string }) {
  return (
    <g>
      <text x={66} y={y + 4} fill={D.faint} fontSize={FONT.tiny} textAnchor="end">
        {label}
      </text>
      <line x1={72} y1={y} x2={790} y2={y} stroke={D.grid} strokeWidth={1} />
    </g>
  );
}

function Msg({
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
        markerEnd={`url(#${reply ? 'seqf-arrow-muted' : 'seqf-arrow'})`}
      />
      <text
        x={(from + to) / 2}
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
