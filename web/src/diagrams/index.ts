import type { ComponentType } from 'react';
import { SequentialVsParallel } from './SequentialVsParallel.js';
import { DecisionTree } from './DecisionTree.js';
import { FanOut } from './FanOut.js';
import { SequenceDiagram } from './SequenceDiagram.js';
import { PublicSurface } from './PublicSurface.js';
import { InheritanceVsComposition } from './InheritanceVsComposition.js';
import { DependencyInversion } from './DependencyInversion.js';
import { FlowDiagram } from './FlowDiagram.js';
import { ArchitectureDiagram } from './ArchitectureDiagram.js';
import { SequenceWithFragments } from './SequenceWithFragments.js';
import { DiagramComparison } from './DiagramComparison.js';
import { ThreeFamilies } from './ThreeFamilies.js';
import { RepositoryPattern } from './RepositoryPattern.js';
import { AllVsAllSettled } from './AllVsAllSettled.js';
import { ConcurrencyLimit } from './ConcurrencyLimit.js';

/**
 * REGISTRY DE DIAGRAMAS: id del item -> componente SVG.
 *
 * Es el mismo patron que la dispatch table del motor de la CLI, aplicado a
 * otra plataforma. Y es la pieza que permite que el CONTENIDO no cambie ni una
 * linea al agregar la web:
 *
 *   el contenido declara QUE diagrama es (su `id`, y un `ascii` de respaldo)
 *   cada plataforma decide COMO dibujarlo (ASCII en terminal, SVG en browser)
 *
 * Trade-off: el vinculo es por string, asi que renombrar un id haria
 * desaparecer el SVG EN SILENCIO (cae al fallback ASCII). Por eso existe
 * `tests/diagrams.test.ts`, que exige que todo DiagramItem del contenido tenga
 * su componente. La alternativa —un campo `svg:` explicito en el item— era mas
 * visible, pero metia una nocion de la capa web adentro de content/.
 */
export const diagramComponents: Readonly<Record<string, ComponentType>> = {
  'c1-d1': SequentialVsParallel,
  'c1-d2': DecisionTree,
  'c2-d1': FanOut,
  'c2-d2': SequenceDiagram,
  'c3-d1': AllVsAllSettled,
  'c3-d2': ConcurrencyLimit,

  // Sección A · POO
  'a1-d1': PublicSurface,
  'a2-d1': InheritanceVsComposition,
  'a3-d1': DependencyInversion,

  // Sección B · Diagramas y modelado
  'b1-d1': FlowDiagram,
  'b1-d2': ArchitectureDiagram,
  'b2-d1': SequenceWithFragments,
  'b3-d1': DiagramComparison,

  // Sección D · Patrones de diseño
  'd1-d1': ThreeFamilies,
  'd2-d1': RepositoryPattern,
};

export function diagramFor(itemId: string): ComponentType | undefined {
  return diagramComponents[itemId];
}
