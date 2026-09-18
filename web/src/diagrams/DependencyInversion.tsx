import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** a3-d1 · La inversión es literalmente dar vuelta la flecha del import. */
export function DependencyInversion() {
  return (
    <svg viewBox="0 0 700 330" className="h-auto w-full" role="img" aria-labelledby="dip-title">
      <title id="dip-title">
        Comparación de la dirección de los imports entre dominio e infraestructura, sin y con
        inversión de dependencias
      </title>
      <defs>
        <ArrowMarker id="dip-arrow-warn" color={D.taskC} />
        <ArrowMarker id="dip-arrow-ok" color={D.accent} />
      </defs>

      <line x1={350} y1={8} x2={350} y2={310} stroke={D.line} strokeWidth={1} strokeDasharray="4 5" />

      {/* ---------- SIN INVERSIÓN ---------- */}
      <text x={10} y={20} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        SIN INVERSIÓN
      </text>

      <Layer x={50} y={40} w={230} label="domain/" title="InvoiceService" />
      <line
        x1={165}
        y1={106}
        x2={165}
        y2={172}
        stroke={D.taskC}
        strokeWidth={2}
        markerEnd="url(#dip-arrow-warn)"
      />
      <text x={175} y={144} fill={D.taskC} fontSize={FONT.tiny} fontFamily={MONO} fontWeight={700}>
        import
      </text>
      <Layer x={50} y={180} w={230} label="infra/" title="PostgresInvoiceRepo" />

      <text x={50} y={280} fill={D.taskC} fontSize={FONT.small} fontWeight={700}>
        la flecha apunta al DETALLE
      </text>
      <text x={50} y={300} fill={D.muted} fontSize={FONT.tiny}>
        cambiar de base de datos toca el dominio
      </text>

      {/* ---------- CON INVERSIÓN ---------- */}
      <text x={372} y={20} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        CON INVERSIÓN
      </text>

      <Layer
        x={396}
        y={40}
        w={276}
        label="domain/"
        title="InvoiceService"
        extra="interface InvoiceRepository"
      />
      <line
        x1={534}
        y1={180}
        x2={534}
        y2={126}
        stroke={D.accent}
        strokeWidth={2}
        markerEnd="url(#dip-arrow-ok)"
      />
      <text x={544} y={158} fill={D.accent} fontSize={FONT.tiny} fontFamily={MONO} fontWeight={700}>
        import
      </text>
      <Layer
        x={396}
        y={180}
        w={276}
        label="infra/"
        title="PostgresInvoiceRepo"
        extra="implements InvoiceRepository"
      />

      <text x={396} y={280} fill={D.accent} fontSize={FONT.small} fontWeight={700}>
        la flecha apunta a lo ESTABLE
      </text>
      <text x={396} y={300} fill={D.muted} fontSize={FONT.tiny}>
        la interfaz la posee el que la usa
      </text>
    </svg>
  );
}

function Layer({
  x,
  y,
  w,
  label,
  title,
  extra,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  title: string;
  extra?: string;
}) {
  const h = extra ? 86 : 66;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text x={x + 14} y={y + 20} fill={D.faint} fontSize={FONT.tiny} fontFamily={MONO}>
        {label}
      </text>
      <text x={x + 14} y={y + 44} fill={D.ink} fontSize={FONT.small} fontWeight={600}>
        {title}
      </text>
      {extra && (
        <text x={x + 14} y={y + 68} fill={D.accent} fontSize={FONT.tiny} fontFamily={MONO}>
          {extra}
        </text>
      )}
    </g>
  );
}
