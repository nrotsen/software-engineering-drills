import { describe, expect, it } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonProgressStore } from '../src/cli/json-store.js';
import { MemoryProgressStore } from '../src/core/memory-store.js';
import { WebProgressStore, createMemoryStorage } from '../web/src/storage/web-progress-store.js';
import type { LevelResult } from '../src/core/domain/progress.js';
import type { ProgressStore } from '../src/core/progress-store.js';

const result: LevelResult = {
  sectionId: 'concurrency',
  level: 1,
  earned: 5,
  possible: 6,
  completedAt: new Date().toISOString(),
};

const stores: [string, () => Promise<ProgressStore>][] = [
  ['MemoryProgressStore', async () => new MemoryProgressStore()],
  [
    'JsonProgressStore',
    async () => new JsonProgressStore(join(await mkdtemp(join(tmpdir(), 'guia-')), 'progress.json')),
  ],
  // La impl de la web entra a la MISMA suite sin tocar el contrato ni los
  // casos: eso es lo que hace que la interfaz ProgressStore haya valido la pena.
  ['WebProgressStore', async () => new WebProgressStore(createMemoryStorage())],
];

// El mismo contrato tiene que cumplirse en las dos implementaciones:
// eso es lo que hace que la interfaz sirva de algo.
describe.each(stores)('%s cumple el contrato ProgressStore', (_name, make) => {
  it('arranca vacío', async () => {
    expect((await (await make()).load()).results).toEqual({});
  });

  it('guarda y recupera por clave sección:nivel', async () => {
    const store = await make();
    await store.record(result);
    expect((await store.load()).results['concurrency:1']).toEqual(result);
  });

  it('el último intento pisa al anterior', async () => {
    const store = await make();
    await store.record(result);
    await store.record({ ...result, earned: 6 });
    expect((await store.load()).results['concurrency:1']?.earned).toBe(6);
  });

  it('reset deja todo vacío', async () => {
    const store = await make();
    await store.record(result);
    await store.reset();
    expect((await store.load()).results).toEqual({});
  });
});

describe('JsonProgressStore', () => {
  it('no explota con un archivo corrupto: arranca limpio', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'guia-')), 'progress.json');
    await writeFile(file, '{ esto no es json', 'utf8');
    expect((await new JsonProgressStore(file).load()).results).toEqual({});
  });
});
