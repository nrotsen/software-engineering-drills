import { describe, expect, it } from 'vitest';
import { isScorable } from '../src/core/domain/item.js';
import { loadSection, registry, SECTION_ORDER } from '../src/core/content/registry.js';
import type { SectionId } from '../src/core/domain/section.js';

/**
 * Tests de CONTENIDO, no de logica: atrapan errores de tipeo al agregar
 * preguntas (ids duplicados, multiple choice sin correcta, etc.). Es barato y
 * te deja escribir contenido sin miedo.
 */
describe('registry', () => {
  it('tiene una entrada por cada sección del temario', () => {
    expect(SECTION_ORDER.length).toBe(Object.keys(registry).length);
  });

  // El test no puede hardcodear una sección pendiente: se van completando.
  // Busca una dinámicamente y, si ya no queda ninguna, verifica lo contrario:
  // que TODAS cargan. Así el test sigue siendo verdad en los dos mundos.
  it('rechaza cargar una sección pendiente, y carga las que están listas', async () => {
    const pending = SECTION_ORDER.find((id) => registry[id].status === 'pending');
    if (pending) {
      await expect(loadSection(pending)).rejects.toThrow(/no está disponible/);
    } else {
      const all = await Promise.all(SECTION_ORDER.map(loadSection));
      expect(all).toHaveLength(SECTION_ORDER.length);
    }
  });

  it('memoiza: dos cargas de la misma sección devuelven el mismo objeto', async () => {
    const [a, b] = await Promise.all([loadSection('concurrency'), loadSection('concurrency')]);
    expect(a).toBe(b);
  });
});

const readyIds = SECTION_ORDER.filter((id) => registry[id].status === 'ready') as SectionId[];

describe.each(readyIds)('contenido de %s', (id) => {
  it('está bien formado', async () => {
    const section = await loadSection(id);
    expect(section.levels.length).toBeGreaterThan(0);

    const ids = new Set<string>();
    for (const level of section.levels) {
      // El nivel 0 es introductorio: teoria y diagramas, sin items puntuables.
      // Los niveles 1..3 sí deben tener al menos uno.
      if (level.level !== 0) {
        expect(level.items.filter(isScorable).length).toBeGreaterThan(0);
      }
      expect(level.summary.length).toBeGreaterThan(0);

      for (const item of level.items) {
        expect(ids.has(item.id), `id duplicado: ${item.id}`).toBe(false);
        ids.add(item.id);

        if (item.kind === 'multipleChoice') {
          expect(item.choices.length, item.id).toBeGreaterThanOrEqual(3);
          expect(item.choices.filter((c) => c.correct).length, item.id).toBe(1);
          for (const c of item.choices) expect(c.why.length, item.id).toBeGreaterThan(20);
        }
      }
    }
  });
});
