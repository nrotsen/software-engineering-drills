import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const SOURCES = [
  { x: 15, name: 'PgUserRepository', source: 'Postgres', note: 'producción' },
  { x: 255, name: 'HttpUserRepository', source: 'API del proveedor', note: 'migración' },
  { x: 495, name: 'InMemoryUserRepository', source: 'un Map', note: 'tests, en ms' },
] as const;

/** d2-d1 · Repository: el negocio depende del contrato, las fuentes se cuelgan. */
export function RepositoryPattern() {
  return (
    <svg viewBox="0 0 700 418" className="h-auto w-full" role="img" aria-labelledby="repo-title">
      <title id="repo-title">
        La lógica de negocio depende de la interfaz UserRepository, y tres implementaciones
        intercambiables —Postgres, una API HTTP y una en memoria— se cuelgan de ese contrato
      </title>
      <defs>
        <ArrowMarker id="repo-arrow" color={D.ink} />
        <ArrowMarker id="repo-arrow-line" color={D.line} />
      </defs>

      <rect x={150} y={12} width={400} height={80} rx={10} fill={D.surface} stroke={D.ink} strokeWidth={1.6} />
      <text x={350} y={36} fill={D.ink} fontSize={FONT.label} fontWeight={700} textAnchor="middle">
        LÓGICA DE NEGOCIO
      </text>
      <text x={350} y={58} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
        habla de: User, Order, Invoice
      </text>
      <text x={350} y={76} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
        NO sabe: SQL, HTTP, archivos
      </text>

      <line x1={350} y1={92} x2={350} y2={126} stroke={D.ink} strokeWidth={2} markerEnd="url(#repo-arrow)" />
      <text x={360} y={114} fill={D.accent} fontSize={FONT.tiny} fontWeight={700}>
        depende de la INTERFAZ
      </text>

      <rect x={150} y={132} width={400} height={90} rx={10} fill="#eff6ff" stroke={D.accent} strokeWidth={1.8} />
      <text x={170} y={156} fill={D.accent} fontSize={FONT.small} fontFamily={MONO} fontWeight={700}>
        interface UserRepository
      </text>
      <text x={186} y={178} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
        findById(id): Promise&lt;User | null&gt;
      </text>
      <text x={186} y={196} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
        findByEmail(email): Promise&lt;User | null&gt;
      </text>
      <text x={186} y={214} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
        save(user): Promise&lt;void&gt;
      </text>

      <path
        d="M350,222 L350,246 M110,246 L590,246 M110,246 L110,268 M350,246 L350,268 M590,246 L590,268"
        stroke={D.line}
        strokeWidth={1.5}
        fill="none"
      />
      <text x={368} y={262} fill={D.faint} fontSize={FONT.tiny}>
        implementan
      </text>

      {SOURCES.map((s) => (
        <g key={s.name}>
          <rect x={s.x} y={272} width={190} height={90} rx={8} fill={D.surface} stroke={D.line} strokeWidth={1.4} />
          <text x={s.x + 95} y={296} fill={D.ink} fontSize={FONT.tiny} fontWeight={700} textAnchor="middle" fontFamily={MONO}>
            {s.name}
          </text>
          <line x1={s.x} y1={306} x2={s.x + 190} y2={306} stroke={D.grid} strokeWidth={1} />
          <text x={s.x + 95} y={328} fill={D.muted} fontSize={FONT.small} textAnchor="middle">
            {s.source}
          </text>
          <text x={s.x + 95} y={348} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
            {s.note}
          </text>
        </g>
      ))}

      <text x={350} y={392} fill={D.ink} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
        La flecha va del negocio a la INTERFAZ, nunca a una implementación.
      </text>
      <text x={350} y={410} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
        Es la misma inversión de dependencias de la Sección A · nivel 3.
      </text>
    </svg>
  );
}
