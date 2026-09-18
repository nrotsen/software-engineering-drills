import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * La regla que sostiene todo el proyecto:
 *
 *      src/cli/  ──▶  src/core/  ◀──  web/src/
 *
 * `core` no conoce a ninguno de sus consumidores. Una regla arquitectonica que
 * solo vive en el README dura hasta el primer viernes apurado; esta falla el CI.
 */
async function tsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = await Promise.all(
    entries.map(async (e) => {
      const path = join(dir, e.name);
      if (e.isDirectory()) return tsFiles(path);
      return e.name.endsWith('.ts') || e.name.endsWith('.tsx') ? [path] : [];
    }),
  );
  return out.flat();
}

const FORBIDDEN = [
  { pattern: /['"](\.\.\/)*cli\//, reason: 'core no puede importar de la CLI' },
  { pattern: /['"].*\/web\//, reason: 'core no puede importar de la web' },
  { pattern: /from\s+['"](chalk|@inquirer\/prompts|react|react-dom)['"]/, reason: 'core no puede depender de una plataforma' },
  { pattern: /from\s+['"]node:/, reason: 'core no puede usar APIs de Node (tiene que correr en el browser)' },
];

describe('límites de arquitectura', () => {
  it('src/core no importa de la CLI, de la web, ni de ninguna plataforma', async () => {
    const files = await tsFiles('src/core');
    expect(files.length).toBeGreaterThan(5);

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const { pattern, reason } of FORBIDDEN) {
        expect(pattern.test(source), `${file}: ${reason}`).toBe(false);
      }
    }
  });
});
