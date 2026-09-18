/**
 * Renderiza un nivel entero a stdout sin interaccion, respondiendo siempre lo
 * mismo. Sirve para revisar como quedan los diagramas y el wrapping despues de
 * tocar contenido, sin tener que jugar el nivel a mano.
 *   npm run preview -- 2
 */
import type { Io, SelectChoice } from '../src/cli/io.js';
import { runLevel } from '../src/cli/run-level.js';
import { noShuffle } from '../src/core/shuffle.js';
import { section } from '../src/core/content/concurrency/index.js';

class PreviewIo implements Io {
  print(t = '') { console.log(t); }
  clear() {}
  async select<T>(_m: string, choices: readonly SelectChoice<T>[]): Promise<T> { return choices[0]!.value; }
  async number() { return 300; }
  async text() { return ''; }
  async pause() {}
}

const level = section.levels[Number(process.argv[2] ?? 1) - 1]!;
await runLevel(section, level, { io: new PreviewIo(), shuffle: noShuffle });
