import type { Section, SectionId } from '../domain/section.js';

/**
 * REGISTRY: el catalogo de secciones. Un mapa `id -> como conseguir la seccion`.
 *
 * Dos ideas juntas:
 *
 * 1. REGISTRY. El catalogo es un dato explicito, no el resultado de escanear
 *    carpetas. Descarte el auto-discovery por filesystem (leer `content/*`) :
 *    es mas "magico" pero pierde el tipado, depende de rutas en runtime y se
 *    rompe si algun dia empaquetas. Con 4 secciones que cambian una vez por
 *    semana, explicito le gana a magico.
 *
 * 2. LAZY LOADING con `import()` dinamico. La seccion se carga recien cuando
 *    la elegis. Con este volumen de datos el ahorro es irrelevante en tiempo,
 *    pero modela bien la intencion y mantiene el arranque O(1) respecto de
 *    cuanto contenido tengas.
 *
 * Bonus: el estado `pending` esta tipado. Una seccion que todavia no escribi
 * NO tiene `load`, asi que es imposible intentar cargarla por accidente: te lo
 * dice el compilador, no un `undefined` en runtime.
 */
export type SectionEntry = {
  readonly id: SectionId;
  readonly title: string;
  readonly blurb: string;
} & (
  | { readonly status: 'ready'; readonly load: () => Promise<Section> }
  | { readonly status: 'pending'; readonly note: string }
);

export const registry: Readonly<Record<SectionId, SectionEntry>> = {
  oop: {
    id: 'oop',
    title: 'A · Programación Orientada a Objetos',
    blurb: 'Los 4 pilares, composición vs herencia, contratos y SOLID.',
    status: 'ready',
    load: () => import('./oop/index.js').then((m) => m.section),
  },
  diagrams: {
    id: 'diagrams',
    title: 'B · Diagramas y modelado',
    blurb: 'Flujo, secuencia y arquitectura: qué pregunta responde cada uno y cuál elegir.',
    status: 'ready',
    load: () => import('./diagrams/index.js').then((m) => m.section),
  },
  concurrency: {
    id: 'concurrency',
    title: 'C · Concurrencia y paralelismo',
    blurb: 'Secuencial vs paralelo, fan-out, latencia, manejo de fallos.',
    status: 'ready',
    load: () => import('./concurrency/index.js').then((m) => m.section),
  },
  patterns: {
    id: 'patterns',
    title: 'D · Patrones de diseño',
    blurb: 'Las 3 familias, los seis comunes en JS/TS, y cuándo NO forzarlos.',
    status: 'ready',
    load: () => import('./patterns/index.js').then((m) => m.section),
  },
};

/** Orden de presentacion en el menu (el orden del temario, no el del objeto). */
export const SECTION_ORDER: readonly SectionId[] = ['oop', 'diagrams', 'concurrency', 'patterns'];

const cache = new Map<SectionId, Promise<Section>>();

/**
 * Memoizacion del loader: si volves a entrar a la misma seccion, no se vuelve
 * a importar. Guardamos la PROMESA, no el valor resuelto: asi dos llamadas
 * concurrentes comparten un solo import en vez de disparar dos.
 * (Es el mismo truco que vas a ver en la Seccion C, nivel 3, con caches.)
 */
export function loadSection(id: SectionId): Promise<Section> {
  const entry = registry[id];
  if (entry.status !== 'ready') {
    return Promise.reject(new Error(`La sección "${entry.title}" todavía no está disponible.`));
  }
  let pending = cache.get(id);
  if (!pending) {
    pending = entry.load();
    cache.set(id, pending);
  }
  return pending;
}
