import { describe, expect, it } from 'vitest';
import { loadSection, registry, SECTION_ORDER } from '@core/content/registry';
import type { SectionId } from '@core/domain/section';
import { diagramComponents } from '../web/src/diagrams/index.js';

/**
 * El vinculo contenido <-> SVG es por string (el id del item), asi que
 * renombrar un id romperia el diagrama EN SILENCIO: la web caeria al fallback
 * ASCII sin avisar. Este test convierte ese fallo silencioso en uno ruidoso.
 * Es el precio de haber elegido no meter un campo `svg:` en el contenido.
 */
const readyIds = SECTION_ORDER.filter((id) => registry[id].status === 'ready') as SectionId[];

describe('registry de diagramas SVG', () => {
  it.each(readyIds)('cada diagrama de %s tiene componente SVG', async (id) => {
    const section = await loadSection(id);
    const diagramIds = section.levels
      .flatMap((l) => l.items)
      .filter((i) => i.kind === 'diagram')
      .map((i) => i.id);

    expect(diagramIds.length).toBeGreaterThan(0);
    for (const diagramId of diagramIds) {
      expect(diagramComponents[diagramId], `falta el SVG de "${diagramId}"`).toBeDefined();
    }
  });

  it('no hay componentes SVG huérfanos', async () => {
    const sections = await Promise.all(readyIds.map(loadSection));
    const known = new Set(
      sections.flatMap((s) => s.levels.flatMap((l) => l.items)).map((i) => i.id),
    );
    for (const key of Object.keys(diagramComponents)) {
      expect(known.has(key), `"${key}" no corresponde a ningún ítem del contenido`).toBe(true);
    }
  });
});
