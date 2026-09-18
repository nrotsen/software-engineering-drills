import { D, FONT } from './palette.js';

const COLS = [
  { title: 'FLUJO', x: 290 },
  { title: 'SECUENCIA', x: 450 },
  { title: 'ARQUITECTURA', x: 610 },
] as const;

type Level = 'full' | 'half' | 'none';

const DIMENSIONS: readonly { label: string; values: readonly [Level, Level, Level] }[] = [
  { label: 'participantes', values: ['none', 'full', 'full'] },
  { label: 'tiempo / orden', values: ['half', 'full', 'none'] },
  { label: 'condiciones', values: ['full', 'half', 'none'] },
  { label: 'estructura estable', values: ['none', 'none', 'full'] },
];

const QUESTIONS = [
  ['¿qué pasa', 'en cada caso?'],
  ['¿quién llama a quién,', 'y cuándo?'],
  ['¿de qué piezas está', 'hecho y qué se cae?'],
] as const;

const AUDIENCES = [
  ['producto', 'QA'],
  ['backend', 'SRE · performance'],
  ['alguien nuevo', 'arquitectura · seguridad'],
] as const;

const STALENESS = [
  ['lento', 'las reglas cambian poco'],
  ['rápido', 'el código cambia siempre'],
  ['medio', 'la topología, por trimestre'],
] as const;

/** b3-d1 · La tabla que resume qué dimensión captura cada tipo. */
export function DiagramComparison() {
  return (
    <svg viewBox="0 0 700 448" className="h-auto w-full" role="img" aria-labelledby="cmp-title">
      <title id="cmp-title">
        Tabla comparativa de los tres tipos de diagrama según qué dimensión capturan, su audiencia
        típica y a qué velocidad se desactualizan
      </title>

      {COLS.map((c) => (
        <text key={c.title} x={c.x} y={24} fill={D.ink} fontSize={FONT.small} fontWeight={700} textAnchor="middle">
          {c.title}
        </text>
      ))}
      <line x1={10} y1={36} x2={690} y2={36} stroke={D.ink} strokeWidth={1.2} />

      {/* Qué pregunta responde */}
      <RowLabel y={62} text="¿qué pregunta" text2="responde?" />
      {COLS.map((c, i) => (
        <g key={c.title}>
          <text x={c.x} y={62} fill={D.accent} fontSize={FONT.tiny} textAnchor="middle" fontWeight={600}>
            {QUESTIONS[i]![0]}
          </text>
          <text x={c.x} y={78} fill={D.accent} fontSize={FONT.tiny} textAnchor="middle" fontWeight={600}>
            {QUESTIONS[i]![1]}
          </text>
        </g>
      ))}
      <line x1={10} y1={98} x2={690} y2={98} stroke={D.grid} strokeWidth={1} />

      {/* Dimensiones, con puntos */}
      {DIMENSIONS.map((dim, r) => {
        const y = 126 + r * 32;
        return (
          <g key={dim.label}>
            <text x={10} y={y + 4} fill={D.muted} fontSize={FONT.small}>
              {dim.label}
            </text>
            {COLS.map((c, i) => (
              <Dot key={c.title} cx={c.x} cy={y} level={dim.values[i]!} />
            ))}
          </g>
        );
      })}
      <line x1={10} y1={272} x2={690} y2={272} stroke={D.grid} strokeWidth={1} />

      {/* Audiencia */}
      <RowLabel y={300} text="audiencia típica" />
      {COLS.map((c, i) => (
        <g key={c.title}>
          <text x={c.x} y={300} fill={D.ink} fontSize={FONT.tiny} textAnchor="middle">
            {AUDIENCES[i]![0]}
          </text>
          <text x={c.x} y={316} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
            {AUDIENCES[i]![1]}
          </text>
        </g>
      ))}
      <line x1={10} y1={336} x2={690} y2={336} stroke={D.grid} strokeWidth={1} />

      {/* Desactualización: la fila que nadie mira y la que más duele */}
      <RowLabel y={364} text="se desactualiza…" />
      {COLS.map((c, i) => (
        <g key={c.title}>
          <text x={c.x} y={364} fill={D.taskC} fontSize={FONT.tiny} fontWeight={700} textAnchor="middle">
            {STALENESS[i]![0]}
          </text>
          <text x={c.x} y={380} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
            {STALENESS[i]![1]}
          </text>
        </g>
      ))}

      <line x1={10} y1={404} x2={690} y2={404} stroke={D.grid} strokeWidth={1} />
      <g>
        <Dot cx={22} cy={428} level="full" />
        <text x={36} y={432} fill={D.muted} fontSize={FONT.tiny}>
          lo muestra bien
        </text>
        <Dot cx={168} cy={428} level="half" />
        <text x={182} y={432} fill={D.muted} fontSize={FONT.tiny}>
          a medias
        </text>
        <Dot cx={276} cy={428} level="none" />
        <text x={290} y={432} fill={D.muted} fontSize={FONT.tiny}>
          no lo muestra
        </text>
      </g>
    </svg>
  );
}

function RowLabel({ y, text, text2 }: { y: number; text: string; text2?: string }) {
  return (
    <g>
      <text x={10} y={y} fill={D.muted} fontSize={FONT.small}>
        {text}
      </text>
      {text2 && (
        <text x={10} y={y + 16} fill={D.muted} fontSize={FONT.small}>
          {text2}
        </text>
      )}
    </g>
  );
}

function Dot({ cx, cy, level }: { cx: number; cy: number; level: Level }) {
  const r = 8;
  if (level === 'full') return <circle cx={cx} cy={cy} r={r} fill={D.ink} />;
  if (level === 'none') return <circle cx={cx} cy={cy} r={r} fill="none" stroke={D.line} strokeWidth={1.5} />;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={D.ink} strokeWidth={1.5} />
      <path d={`M${cx},${cy - r} A ${r} ${r} 0 0 1 ${cx},${cy + r} Z`} fill={D.ink} />
    </g>
  );
}
