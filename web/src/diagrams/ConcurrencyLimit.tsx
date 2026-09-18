import { D, FONT } from './palette.js';

const TASKS = 12;
const LIMIT = 4;
const BAR_H = 10;
const ROW = 14;

/** c3-d2 · Sin techo, la cola se muda al otro lado. */
export function ConcurrencyLimit() {
  return (
    <svg viewBox="0 0 700 372" className="h-auto w-full" role="img" aria-labelledby="limit-title">
      <title id="limit-title">
        Doce tareas lanzadas todas a la vez, que se degradan, comparadas con las mismas doce con un
        pool de cuatro, que terminan antes y de forma predecible
      </title>

      <line x1={348} y1={10} x2={348} y2={330} stroke={D.line} strokeWidth={1} strokeDasharray="4 5" />

      {/* Sin límite: todas arrancan juntas y cada una tarda más */}
      <text x={10} y={22} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        SIN LÍMITE
      </text>
      <text x={10} y={40} fill={D.muted} fontSize={FONT.tiny}>
        12 tareas lanzadas en el mismo tick
      </text>
      {Array.from({ length: TASKS }, (_, i) => (
        <rect key={i} x={30} y={54 + i * ROW} width={280} height={BAR_H} rx={3} fill={D.taskC} opacity={0.8} />
      ))}
      <path d="M30,232 L30,238 L310,238 L310,232" fill="none" stroke={D.ink} strokeWidth={1.2} />
      <text x={30} y={256} fill={D.ink} fontSize={FONT.small} fontWeight={700}>
        cada una tarda MÁS
      </text>
      <text x={30} y={274} fill={D.muted} fontSize={FONT.tiny}>
        la cola se mudó al otro lado
      </text>
      <text x={30} y={296} fill={D.faint} fontSize={FONT.tiny}>
        se rompe primero: sockets del agente,
      </text>
      <text x={30} y={310} fill={D.faint} fontSize={FONT.tiny}>
        429 del downstream, memoria en vuelo
      </text>

      {/* Con límite: tres tandas de cuatro */}
      <text x={372} y={22} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        CON LÍMITE
      </text>
      <text x={462} y={22} fill={D.accent} fontSize={FONT.small} fontWeight={600}>
        4 en vuelo
      </text>
      <text x={372} y={40} fill={D.muted} fontSize={FONT.tiny}>
        las mismas 12 tareas, pool de 4
      </text>
      {Array.from({ length: TASKS }, (_, i) => {
        const wave = Math.floor(i / LIMIT);
        return (
          <rect
            key={i}
            x={392 + wave * 70}
            y={54 + i * ROW}
            width={66}
            height={BAR_H}
            rx={3}
            fill={D.taskA}
          />
        );
      })}
      {[0, 1, 2].map((w) => (
        <text key={w} x={392 + w * 70 + 33} y={228} fill={D.faint} fontSize={FONT.tiny} textAnchor="middle">
          {w + 1}
        </text>
      ))}
      <path d="M392,232 L392,238 L602,238 L602,232" fill="none" stroke={D.ink} strokeWidth={1.2} />
      <text x={392} y={256} fill={D.ink} fontSize={FONT.small} fontWeight={700}>
        ceil(12 / 4) × 100ms = 300ms
      </text>
      <text x={392} y={274} fill={D.muted} fontSize={FONT.tiny}>
        predecible, y el downstream no se entera
      </text>

      <text x={10} y={352} fill={D.accent} fontSize={FONT.small} fontWeight={600}>
        Pasado el punto de saturación, el techo no te cuesta velocidad: te la da.
      </text>
    </svg>
  );
}
