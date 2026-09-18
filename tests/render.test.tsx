import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Item } from '@core/domain/item';
import { loadSection } from '@core/content/registry';
import { diagramComponents } from '../web/src/diagrams/index.js';
import { ItemView } from '../web/src/items/ItemView.js';

/**
 * Smoke test de render: no verifica que se vea lindo (eso no lo puede hacer un
 * test), pero SI que ningun componente explote y que el contenido real llegue
 * al HTML. Es barato y atrapa el 90% de las roturas al tocar contenido o SVGs.
 */
describe('diagramas SVG', () => {
  it.each(Object.entries(diagramComponents))('%s renderiza un <svg> con viewBox', (_id, Diagram) => {
    const html = renderToStaticMarkup(<Diagram />);
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox');
    // Accesibilidad: un diagrama sin descripcion es invisible para un lector
    // de pantalla, y ademas obliga a explicar que muestra.
    expect(html).toContain('<title');
  });
});

describe('vistas de item', () => {
  it('renderiza todos los ítems del contenido sin romperse', async () => {
    const section = await loadSection('concurrency');
    const items: Item[] = section.levels.flatMap((l) => [...l.items]);
    expect(items.length).toBeGreaterThan(20);

    for (const item of items) {
      const html = renderToStaticMarkup(
        <ItemView item={item} answered={undefined} choiceOrder={undefined} onAnswer={() => {}} />,
      );
      expect(html.length, item.id).toBeGreaterThan(50);
    }
  });

  it('el multiple choice renderiza el snippet opcional cuando lo tiene', () => {
    const withSnippet: Item = {
      id: 'fixture',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es?',
      snippet: 'const instance = Registry.getInstance();',
      choices: [
        { text: 'Singleton', correct: true, why: 'una sola instancia global' },
        { text: 'Factory', correct: false, why: 'no crea familias de objetos' },
        { text: 'Adapter', correct: false, why: 'no traduce interfaces' },
      ],
    };
    const html = renderToStaticMarkup(
      <ItemView item={withSnippet} answered={undefined} choiceOrder={undefined} onAnswer={() => {}} />,
    );
    expect(html).toContain('Registry');
    expect(html).toContain('getInstance');
    // El snippet es presentación: no cambia nada de la corrección.
    expect(html).toContain('¿Qué patrón es?');
  });

  it('el multiple choice muestra la explicación de TODAS las opciones al corregir', async () => {
    const section = await loadSection('concurrency');
    const item = section.levels
      .flatMap((l) => l.items)
      .find((i) => i.kind === 'multipleChoice')!;
    if (item.kind !== 'multipleChoice') throw new Error('fixture');

    const html = renderToStaticMarkup(
      <ItemView
        item={item}
        answered={{
          answer: { kind: 'multipleChoice', choiceIndex: 0 },
          outcome: { earned: 0, possible: 1 },
        }}
        choiceOrder={item.choices.map((_, i) => i)}
        onAnswer={() => {}}
      />,
    );

    for (const choice of item.choices) {
      expect(html).toContain(escapeHtml(choice.why.slice(0, 40)));
    }
  });
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
