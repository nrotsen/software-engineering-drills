import { D, FONT } from './palette.js';

/** 1 ms = 1 px. Toda la escala del dibujo sale de esta constante. */
const X0 = 96;
const MS = 1;
const x = (ms: number) => X0 + ms * MS;

const TASKS = [
  { name: 'A', ms: 100, color: D.taskA },
  { name: 'B', ms: 200, color: D.taskB },
  { name: 'C', ms: 150, color: D.taskC },
] as const;

const BAR_H = 20;
const ROW = 28;
/** Alto del encabezado de cada panel (título + subtítulo) antes de las barras. */
const HEAD = 46;
const PANEL_1 = 10;
const PANEL_2 = 180;

export function SequentialVsParallel() {
  // Secuencial: cada tarea arranca donde terminó la anterior.
  let cursor = 0;
  const sequential = TASKS.map((t) => {
    const start = cursor;
    cursor += t.ms;
    return { ...t, start };
  });

  return (
    <svg viewBox="0 0 660 364" className="h-auto w-full" role="img" aria-labelledby="svp-title">
      <title id="svp-title">
        Comparación en el tiempo entre ejecución secuencial (450 ms) y paralela (200 ms)
      </title>

      {/* Grilla de tiempo: da la referencia para leer los largos como duraciones */}
      {[0, 100, 200, 300, 400, 500].map((ms) => (
        <g key={ms}>
          <line x1={x(ms)} y1={48} x2={x(ms)} y2={316} stroke={D.grid} strokeWidth={1} />
          <text x={x(ms)} y={338} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
            {ms}
          </text>
        </g>
      ))}
      <text x={x(500) + 24} y={338} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
        ms
      </text>

      <Panel
        y={PANEL_1}
        title="SECUENCIAL"
        subtitle="suma: 100 + 200 + 150"
        bars={sequential}
        total={cursor}
      />
      <Panel
        y={PANEL_2}
        title="PARALELO"
        subtitle="máximo: max(100, 200, 150)"
        bars={TASKS.map((t) => ({ ...t, start: 0 }))}
        total={Math.max(...TASKS.map((t) => t.ms))}
        critical="B"
      />
    </svg>
  );
}

interface Bar {
  readonly name: string;
  readonly ms: number;
  readonly start: number;
  readonly color: string;
}

function Panel({
  y,
  title,
  subtitle,
  bars,
  total,
  critical,
}: {
  y: number;
  title: string;
  subtitle: string;
  bars: readonly Bar[];
  total: number;
  critical?: string;
}) {
  const top = y + HEAD;
  const bracketY = top + bars.length * ROW + 4;

  return (
    <g>
      <text x={0} y={y + 14} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        {title}
      </text>
      <text x={0} y={y + 32} fill={D.muted} fontSize={FONT.small}>
        {subtitle}
      </text>

      {bars.map((b, i) => {
        const barY = top + i * ROW;
        const isCritical = b.name === critical;
        const endX = x(b.start) + b.ms * MS;
        return (
          <g key={b.name}>
            <text
              x={X0 - 12}
              y={barY + BAR_H / 2 + 4}
              fill={D.muted}
              fontSize={FONT.small}
              textAnchor="end"
            >
              {b.name}
            </text>
            <rect
              x={x(b.start)}
              y={barY}
              width={b.ms * MS}
              height={BAR_H}
              rx={4}
              fill={b.color}
              stroke={isCritical ? D.ink : 'none'}
              strokeWidth={isCritical ? 1.5 : 0}
            />
            {/* La duración va DENTRO de la barra: afuera chocaba con la etiqueta
                del total cuando la barra terminaba cerca del final. */}
            <text
              x={endX - 8}
              y={barY + BAR_H / 2 + 4}
              fill="#ffffff"
              fontSize={FONT.tiny}
              fontWeight={600}
              textAnchor="end"
            >
              {b.ms} ms
            </text>
            {isCritical && (
              <text x={endX + 12} y={barY + BAR_H / 2 + 4} fill={D.ink} fontSize={FONT.tiny} fontWeight={600}>
                ← la más lenta manda
              </text>
            )}
          </g>
        );
      })}

      {/* Corchete del total: es LO que hay que comparar entre los dos paneles */}
      <path
        d={`M${x(0)},${bracketY} L${x(0)},${bracketY + 6} L${x(total)},${bracketY + 6} L${x(total)},${bracketY}`}
        fill="none"
        stroke={D.ink}
        strokeWidth={1.2}
      />
      <text
        x={(x(0) + x(total)) / 2}
        y={bracketY + 24}
        fill={D.ink}
        fontSize={FONT.label}
        fontWeight={700}
        textAnchor="middle"
      >
        {total} ms
      </text>
    </g>
  );
}
