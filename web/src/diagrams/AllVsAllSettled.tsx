import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const X0 = 150;
const TASKS = [
  { name: 'A', ms: 200, color: D.taskA, fails: false },
  { name: 'B', ms: 120, color: D.taskC, fails: true },
  { name: 'C', ms: 300, color: D.taskB, fails: false },
] as const;

/** c3-d1 · La diferencia no es sólo cuándo termina: es qué se pierde. */
export function AllVsAllSettled() {
  return (
    <svg viewBox="0 0 700 400" className="h-auto w-full" role="img" aria-labelledby="settled-title">
      <title id="settled-title">
        Comparación entre Promise.all, que rechaza al primer fallo y descarta los resultados
        exitosos, y Promise.allSettled, que espera a todas y devuelve el estado de cada una
      </title>

      <Panel y={16} title="Promise.all" cut={120} />
      <Panel y={216} title="Promise.allSettled" />
    </svg>
  );
}

function Panel({ y, title, cut }: { y: number; title: string; cut?: number }) {
  const top = y + 26;
  return (
    <g>
      <text x={0} y={y + 14} fill={D.ink} fontSize={FONT.title} fontWeight={700} fontFamily={MONO}>
        {title}
      </text>

      {TASKS.map((t, i) => {
        const by = top + i * 26;
        // Con `all`, la parte posterior al corte se dibuja fantasma: sigue
        // corriendo pero su resultado ya no le llega a nadie.
        const cutAt = cut !== undefined && t.ms > cut ? cut : t.ms;
        return (
          <g key={t.name}>
            <text x={X0 - 14} y={by + 12} fill={D.muted} fontSize={FONT.small} textAnchor="end">
              {t.name}
            </text>
            <rect x={X0} y={by} width={cutAt} height={14} rx={3} fill={t.color} />
            {cutAt < t.ms && (
              <rect x={X0 + cutAt} y={by} width={t.ms - cutAt} height={14} rx={3} fill={t.color} opacity={0.22} />
            )}
            {t.fails ? (
              <>
                <text x={X0 + t.ms + 8} y={by + 12} fill={D.taskC} fontSize={FONT.small} fontWeight={700}>
                  ✕
                </text>
                <text x={X0 + t.ms + 22} y={by + 12} fill={D.muted} fontSize={FONT.tiny}>
                  falla ({t.ms}ms)
                </text>
              </>
            ) : (
              <text x={X0 + t.ms + 10} y={by + 12} fill={D.muted} fontSize={FONT.tiny}>
                ok ({t.ms}ms)
              </text>
            )}
          </g>
        );
      })}

      {cut !== undefined ? (
        <g>
          <line x1={X0 + cut} y1={top - 8} x2={X0 + cut} y2={top + 92} stroke={D.taskC} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={X0 + cut + 8} y={top + 108} fill={D.taskC} fontSize={FONT.tiny} fontWeight={700}>
            rechaza acá, a los 120ms
          </text>
          <text x={X0 + cut + 8} y={top + 124} fill={D.muted} fontSize={FONT.tiny}>
            A y C siguen corriendo: no se cancelan
          </text>
          <text x={X0 + cut + 8} y={top + 138} fill={D.muted} fontSize={FONT.tiny}>
            y sus resultados se pierden
          </text>
        </g>
      ) : (
        <g>
          <line x1={X0 + 300} y1={top - 8} x2={X0 + 300} y2={top + 92} stroke={D.accent} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={X0 + 8} y={top + 108} fill={D.accent} fontSize={FONT.tiny} fontWeight={700}>
            resuelve a los 300ms con:
          </text>
          <text x={X0 + 8} y={top + 124} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
            {'[ { status: "fulfilled", value },'}
          </text>
          <text x={X0 + 8} y={top + 138} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
            {'  { status: "rejected",  reason },'}
          </text>
          <text x={X0 + 8} y={top + 152} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
            {'  { status: "fulfilled", value } ]'}
          </text>
        </g>
      )}
    </g>
  );
}
