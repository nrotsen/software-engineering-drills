import { tokenize, type TokenType } from '../lib/highlight.js';

const COLORS: Record<TokenType, string> = {
  plain: 'text-slate-200',
  comment: 'text-slate-500 italic',
  string: 'text-emerald-300',
  number: 'text-amber-300',
  keyword: 'text-violet-300',
  fn: 'text-sky-300',
};

/**
 * Fondo oscuro para el codigo aunque la app sea clara: separa "esto es codigo"
 * de "esto es texto" sin necesidad de un borde ni un titulo. Es la convencion
 * que ya tenes internalizada de cualquier editor.
 */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] leading-relaxed">
      <code className="font-mono">
        {tokenize(code.trim()).map((token, i) => (
          <span key={i} className={COLORS[token.type]}>
            {token.text}
          </span>
        ))}
      </code>
    </pre>
  );
}
