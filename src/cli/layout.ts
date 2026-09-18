/** Helpers de layout en texto plano. Sin dependencias, sin color. */

/** Ancho util de la terminal, acotado a 80 para que el texto siga siendo legible. */
export function width(): number {
  const cols = process.stdout.columns ?? 80;
  return Math.max(40, Math.min(cols - 2, 80));
}

export function rule(char = '─'): string {
  return char.repeat(width());
}

/** Corta un parrafo en lineas de `max` caracteres sin partir palabras. */
export function wrap(text: string, max = width()): string {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (line === '') line = word;
      else if (line.length + 1 + word.length <= max) line += ` ${word}`;
      else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out.join('\n');
}

export function indent(text: string, pad = '  '): string {
  return text
    .split('\n')
    .map((l) => (l === '' ? l : pad + l))
    .join('\n');
}

/**
 * Quita la indentacion comun de un template literal, para poder escribir
 * snippets y diagramas alineados con el codigo fuente sin que salgan corridos.
 */
export function dedent(text: string): string {
  const lines = text.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const indents = lines
    .filter((l) => l.trim() !== '')
    .map((l) => l.match(/^ */)?.[0].length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}
