import { ArrowMarker } from './Marker.js';
import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** a2-d1 · El mismo reuso con dos superficies públicas muy distintas. */
export function InheritanceVsComposition() {
  return (
    <svg viewBox="0 0 700 372" className="h-auto w-full" role="img" aria-labelledby="ivc-title">
      <title id="ivc-title">
        Diagrama de clases comparando herencia (es-un) con composición (tiene-un) para el mismo
        UserService
      </title>
      <defs>
        <ArrowMarker id="ivc-arrow" color={D.ink} />
      </defs>

      <line x1={350} y1={8} x2={350} y2={352} stroke={D.line} strokeWidth={1} strokeDasharray="4 5" />

      {/* ---------- HERENCIA ---------- */}
      <text x={10} y={20} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        HERENCIA
      </text>
      <text x={98} y={20} fill={D.muted} fontSize={FONT.small}>
        es-un
      </text>

      <ClassBox
        x={90}
        y={34}
        w={180}
        title="ApiClient"
        members={[
          { text: '+ get()' },
          { text: '+ post()' },
          { text: '# baseUrl' },
        ]}
      />

      {/* Triángulo hueco = herencia, en notación UML */}
      <path d="M180,128 L171,146 L189,146 Z" fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <line x1={180} y1={196} x2={180} y2={146} stroke={D.ink} strokeWidth={1.5} />
      <text x={190} y={176} fill={D.muted} fontSize={FONT.tiny} fontFamily={MONO}>
        extends
      </text>

      <ClassBox
        x={90}
        y={196}
        w={180}
        title="UserService"
        members={[
          { text: '+ findById()' },
          { text: '+ get()', warn: true },
          { text: '+ post()', warn: true },
        ]}
      />

      <text x={10} y={318} fill={D.taskC} fontSize={FONT.tiny} fontWeight={700}>
        heredados sin decidirlo
      </text>
      <text x={10} y={334} fill={D.muted} fontSize={FONT.tiny}>
        userService.post() existe y nadie
      </text>
      <text x={10} y={348} fill={D.muted} fontSize={FONT.tiny}>
        eligió que existiera.
      </text>

      {/* ---------- COMPOSICIÓN ---------- */}
      <text x={372} y={20} fill={D.ink} fontSize={FONT.title} fontWeight={700}>
        COMPOSICIÓN
      </text>
      <text x={492} y={20} fill={D.muted} fontSize={FONT.small}>
        tiene-un
      </text>

      <ClassBox
        x={450}
        y={34}
        w={180}
        title="UserService"
        members={[{ text: '- api: ApiClient', dim: true }, { text: '+ findById()' }]}
      />

      {/* Rombo lleno = composición, del lado del que POSEE */}
      <path d="M540,112 L531,124 L540,136 L549,124 Z" fill={D.ink} />
      <line
        x1={540}
        y1={136}
        x2={540}
        y2={190}
        stroke={D.ink}
        strokeWidth={1.5}
        markerEnd="url(#ivc-arrow)"
      />
      <text x={550} y={168} fill={D.muted} fontSize={FONT.tiny}>
        usa
      </text>

      <ClassBox
        x={450}
        y={196}
        w={180}
        title="ApiClient"
        members={[{ text: '+ get()' }, { text: '+ post()' }]}
      />

      <text x={372} y={318} fill={D.accent} fontSize={FONT.tiny} fontWeight={700}>
        superficie bajo control
      </text>
      <text x={372} y={334} fill={D.muted} fontSize={FONT.tiny}>
        UserService expone SÓLO findById().
      </text>
      <text x={372} y={348} fill={D.muted} fontSize={FONT.tiny}>
        api es un detalle privado.
      </text>
    </svg>
  );
}

interface Member {
  readonly text: string;
  readonly warn?: boolean;
  readonly dim?: boolean;
}

/** Caja UML: nombre arriba, línea, miembros abajo. */
function ClassBox({
  x,
  y,
  w,
  title,
  members,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  members: readonly Member[];
}) {
  const headerH = 28;
  const h = headerH + members.length * 18 + 12;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={D.surface} stroke={D.ink} strokeWidth={1.5} />
      <text
        x={x + w / 2}
        y={y + 19}
        fill={D.ink}
        fontSize={FONT.small}
        fontWeight={700}
        textAnchor="middle"
      >
        {title}
      </text>
      <line x1={x} y1={y + headerH} x2={x + w} y2={y + headerH} stroke={D.ink} strokeWidth={1} />
      {members.map((m, i) => (
        <text
          key={m.text}
          x={x + 12}
          y={y + headerH + 18 + i * 18}
          fill={m.warn ? D.taskC : m.dim ? D.faint : D.muted}
          fontSize={FONT.tiny}
          fontFamily={MONO}
          fontWeight={m.warn ? 700 : 400}
        >
          {m.text}
          {m.warn ? '   (!)' : ''}
        </text>
      ))}
    </g>
  );
}
