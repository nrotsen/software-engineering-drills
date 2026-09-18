import { D, FONT } from './palette.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const FAMILIES = [
  {
    x: 15,
    color: D.taskA,
    title: 'CREACIONALES',
    q1: '¿cómo se crea',
    q2: 'esto?',
    axis1: 'el momento de',
    axis2: 'la CREACIÓN',
    patterns: ['Factory', 'Builder', 'Singleton', 'Prototype'],
    repo: 'content/registry.ts',
    repoNote1: 'Registry + factory',
    repoNote2: 'functions por sección',
  },
  {
    x: 245,
    color: D.taskC,
    title: 'ESTRUCTURALES',
    q1: '¿cómo encajan',
    q2: 'estas piezas?',
    axis1: 'la relación',
    axis2: 'ESTÁTICA',
    patterns: ['Adapter', 'Decorator', 'Facade', 'Proxy', 'Composite'],
    repo: 'cli/inquirer-io.ts',
    repoNote1: 'adapta inquirer',
    repoNote2: 'al puerto Io',
  },
  {
    x: 475,
    color: D.taskB,
    title: 'DE COMPORTAMIENTO',
    q1: '¿cómo colaboran',
    q2: 'y quién decide?',
    axis1: 'la conversación',
    axis2: 'en RUNTIME',
    patterns: ['Strategy', 'Observer', 'Command', 'State', 'Template Method'],
    repo: 'cli/handlers/index.ts',
    repoNote1: 'dispatch table por',
    repoNote2: 'kind = Strategy',
  },
] as const;

const W = 210;

/** d1-d1 · Las tres familias, ordenadas por el problema que resuelven. */
export function ThreeFamilies() {
  return (
    <svg viewBox="0 0 700 400" className="h-auto w-full" role="img" aria-labelledby="fam-title">
      <title id="fam-title">
        Las tres familias de patrones —creacionales, estructurales y de comportamiento— con la
        pregunta que responde cada una, sus patrones más comunes y un ejemplo real de este repositorio
      </title>

      <text x={350} y={18} fill={D.muted} fontSize={FONT.small} fontWeight={600} textAnchor="middle">
        ¿QUÉ PROBLEMA TENÉS?
      </text>

      {FAMILIES.map((f) => (
        <g key={f.title}>
          <rect x={f.x} y={30} width={W} height={264} rx={10} fill={D.surface} stroke={D.line} strokeWidth={1.4} />
          <path
            d={`M${f.x + 10},30 L${f.x + W - 10},30 A10,10 0 0 1 ${f.x + W},40 L${f.x + W},36 L${f.x},36 L${f.x},40 A10,10 0 0 1 ${f.x + 10},30 Z`}
            fill={f.color}
          />
          <rect x={f.x} y={30} width={W} height={6} fill={f.color} />

          <text x={f.x + W / 2} y={58} fill={D.ink} fontSize={FONT.small} fontWeight={700} textAnchor="middle">
            {f.title}
          </text>
          <text x={f.x + W / 2} y={82} fill={D.accent} fontSize={FONT.tiny} textAnchor="middle" fontWeight={600}>
            {f.q1}
          </text>
          <text x={f.x + W / 2} y={97} fill={D.accent} fontSize={FONT.tiny} textAnchor="middle" fontWeight={600}>
            {f.q2}
          </text>

          <line x1={f.x + 16} y1={112} x2={f.x + W - 16} y2={112} stroke={D.grid} strokeWidth={1} />

          {f.patterns.map((p, i) => (
            <text key={p} x={f.x + 20} y={134 + i * 20} fill={D.ink} fontSize={FONT.tiny} fontFamily={MONO}>
              {p}
            </text>
          ))}

          <text x={f.x + W / 2} y={252} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
            {f.axis1}
          </text>
          <text x={f.x + W / 2} y={268} fill={D.ink} fontSize={FONT.tiny} fontWeight={700} textAnchor="middle">
            {f.axis2}
          </text>
        </g>
      ))}

      {/* Ejemplos vivos: los tres están en este mismo repositorio */}
      <text x={15} y={326} fill={D.faint} fontSize={FONT.tiny} fontWeight={700}>
        EN ESTE REPO
      </text>
      <line x1={15} y1={334} x2={685} y2={334} stroke={D.grid} strokeWidth={1} />
      {FAMILIES.map((f) => (
        <g key={f.repo}>
          <text x={f.x + W / 2} y={354} fill={D.accent} fontSize={FONT.tiny} fontFamily={MONO} textAnchor="middle">
            {f.repo}
          </text>
          <text x={f.x + W / 2} y={370} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
            {f.repoNote1}
          </text>
          <text x={f.x + W / 2} y={384} fill={D.muted} fontSize={FONT.tiny} textAnchor="middle">
            {f.repoNote2}
          </text>
        </g>
      ))}
    </svg>
  );
}
