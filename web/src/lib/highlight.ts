export type TokenType = 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'fn';

export interface Token {
  readonly type: TokenType;
  readonly text: string;
}

const KEYWORDS = [
  'async', 'await', 'const', 'let', 'var', 'function', 'return', 'for', 'of', 'in',
  'if', 'else', 'new', 'class', 'extends', 'try', 'catch', 'finally', 'throw',
  'import', 'export', 'from', 'default', 'typeof', 'instanceof', 'while', 'break',
  'continue', 'null', 'undefined', 'true', 'false', 'this', 'void',
].join('|');

/**
 * Highlighter de juguete: UNA expresion regular con alternativas, en orden de
 * prioridad. No es un parser -- no entiende contexto, asi que hay casos que
 * puede tokenizar mal (una barra de division confundida con regex, por ejemplo).
 *
 * Trade-off elegido a conciencia: los snippets del contenido son de 5-10 lineas
 * de JS simple, donde esto acierta siempre; a cambio no sumamos una dependencia
 * ni ~15kb al bundle por algo puramente decorativo. Si el contenido creciera a
 * TypeScript con genericos o JSX, la respuesta correcta seria Shiki o Prism.
 *
 * El orden de las alternativas ES la logica: comentarios y strings van primero
 * para que un `//` adentro de un string no se coma el resto de la linea, y para
 * que un apostrofe adentro de un comentario no abra un string.
 */
const PATTERN = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<string>'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\`(?:[^\`\\]|\\.)*\`)`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    String.raw`\b(?<keyword>${KEYWORDS})\b`,
    String.raw`(?<fn>\b[A-Za-z_$][\w$]*(?=\())`,
  ].join('|'),
  'g',
);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  for (const match of code.matchAll(PATTERN)) {
    const start = match.index;
    if (start > last) tokens.push({ type: 'plain', text: code.slice(last, start) });

    const groups = match.groups ?? {};
    const type = (Object.keys(groups).find((k) => groups[k] !== undefined) ?? 'plain') as TokenType;
    tokens.push({ type, text: match[0] });
    last = start + match[0].length;
  }

  if (last < code.length) tokens.push({ type: 'plain', text: code.slice(last) });
  return tokens;
}
