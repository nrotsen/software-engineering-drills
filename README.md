# Guía interactiva

Estudio activo de ingeniería de software: teoría corta, multiple choice con explicación por opción,
verdadero/falso, ejercicios de código, cálculos de latencia y diagramas.

**Dos frontends, un solo core:** una CLI y una web app que comparten el dominio, el contenido y las
reglas de corrección.

**Estado: completa.** Las cuatro secciones con sus tres niveles cada una.
**113 ítems puntuables · 169 ítems · 15 diagramas SVG.**

| Sección | Puntuables | Ítems |
|---|---:|---:|
| A · Programación Orientada a Objetos | 28 | 45 |
| B · Diagramas y modelado | 25 | 38 |
| C · Concurrencia y paralelismo | 33 | 45 |
| D · Patrones de diseño | 27 | 41 |

---

## Cómo correrlo

```bash
npm install

npm run dev              # CLI  (tsx, sin compilar)
npm run web              # web  (Vite dev server)
```

| Comando | Qué hace |
|---|---|
| `npm test` | 58 tests: core, CLI, web y límites de arquitectura |
| `npm run typecheck` | tsc del core + CLI |
| `npm run build` / `npm start` | compila y corre la CLI |
| `npm run web:build` | build de producción de la web (`dist-web/`) |
| `npm run preview -- 2` | renderiza un nivel completo en la terminal, sin interacción |
| `/preview/concurrency/2` | lo mismo en la web (ruta sólo de desarrollo) |

Progreso: la CLI guarda en `./progress.json`, la web en `localStorage`. Son almacenes separados.

---

## Arquitectura: cómo comparten el core la CLI y la web

```
                         ┌──────────────────┐
                         │    src/core/     │   sin dependencias de plataforma
                         │                  │   (ni node:, ni chalk, ni react)
                         │  domain/         │
                         │  content/        │
                         │  grading.ts      │
                         │  scoring.ts      │
                         │  shuffle.ts      │
                         │  progress-store  │
                         └────────▲─────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
          ┌───────┴────────┐             ┌────────┴────────┐
          │    src/cli/    │             │    web/src/     │
          │  inquirer      │             │  React + Vite   │
          │  chalk         │             │  Tailwind       │
          │  JSON en disco │             │  localStorage   │
          └────────────────┘             └─────────────────┘
```

**El core no conoce a ninguno de sus consumidores.** No es una promesa del README:
[`tests/architecture.test.ts`](tests/architecture.test.ts) lee todos los archivos de `src/core/` y
falla si alguno importa de `cli/`, de `web/`, de `react`, de `chalk` o siquiera de `node:`. Una regla
arquitectónica que sólo vive en la documentación dura hasta el primer viernes apurado.

### Qué se comparte exactamente

| Pieza | CLI | Web | Nota |
|---|:--:|:--:|---|
| `domain/` — tipos, union discriminada de ítems | ✅ | ✅ | |
| `content/` — las preguntas y los diagramas | ✅ | ✅ | **cero cambios** al agregar la web |
| `grading.ts` — qué respuesta está bien | ✅ | ✅ | extraído de los handlers de la CLI |
| `scoring.ts`, `shuffle.ts` | ✅ | ✅ | puros |
| `ProgressStore` (la interfaz) | ✅ | ✅ | dos implementaciones |
| El orquestador del nivel | `run-level.ts` | `levelSession.ts` | **a propósito no se comparte** |
| Render de un ítem | `cli/handlers/` | `web/src/items/` | mismo patrón, distinta plataforma |

### La decisión de fondo: la corrección no estaba separada

Al empezar, la lógica de corrección vivía **dentro** de los renderers de la terminal:
`multiple-choice.ts` decidía `picked.correct`, `numeric.ts` hacía la resta con la tolerancia.
Funcionaba, pero mezclaba dos cosas de naturaleza distinta:

- **qué está bien** → una regla del dominio, pura, sin plataforma
- **cómo se pide y se pinta** → presentación, distinta en terminal y en browser

Extraerla a [`src/core/grading.ts`](src/core/grading.ts) fue el primer paso, antes de escribir una
línea de React:

```ts
export type Answer =
  | { kind: 'multipleChoice'; choiceIndex: number }
  | { kind: 'trueFalse';      value: boolean }
  | { kind: 'numeric';        value: number }
  | { kind: 'code';           selfGrade: 1 | 0.5 | 0 };

export function grade(item: ScorableItem, answer: Answer): ItemOutcome
```

El handler de inquirer construye un `Answer` desde un prompt; el reducer de React lo construye desde
un `onClick`. **`grade` recibe exactamente lo mismo en los dos casos** — y por eso
[`tests/grading.test.ts`](tests/grading.test.ts) prueba la regla una sola vez y vale para las dos apps.

> Detalle que importa: `choiceIndex` es el índice en el array **original**, no en el orden barajado
> que ve el usuario. La capa de presentación traduce "la tercera que estoy mostrando" a "la primera
> del array". Así la respuesta es serializable y sigue significando lo mismo fuera de contexto.

### Lo que NO se comparte, y por qué

`runLevel` (CLI) y `levelSession` (web) hacen lo mismo y son código distinto. No es descuido:

```
CLI     el motor TIRA de la respuesta     const r = await io.select(...)   [pull]
React   la respuesta EMPUJA al estado     onClick={() => dispatch(...)}    [push]
```

Es una **inversión de control**. El loop de la CLI se bloquea esperando; React es una función de
estado a UI que reacciona a eventos y no puede "esperar" sin ceder el control. Se puede forzar un
orquestador único —async generators, o un `Io` falso cuyas promesas resuelve un `onClick`— y es
exactamente el tipo de abstracción ingeniosa que después nadie puede debuggear.

**La duplicación es de FORMA, no de REGLAS.** Hay dos orquestadores, pero una sola definición de qué
está bien. Ese es el corte correcto: duplicar estructura es barato, duplicar reglas es lo que te
rompe en producción cuando cambiás una y te olvidás de la otra.

### Los diagramas: el contenido no cambió ni una línea

`DiagramItem` tiene un campo `ascii`. La web necesita SVG. En vez de duplicar contenido o meter JSX
en `content/`, cada plataforma tiene **su propia dispatch table**, indexada por el `id` del ítem:

```ts
// web/src/diagrams/index.ts
export const diagramComponents = {
  'c1-d1': SequentialVsParallel,   // secuencial vs paralelo, en el tiempo
  'c1-d2': DecisionTree,           // ¿depende? → ¿I/O o CPU?
  'c2-d1': FanOut,                 // fan-out / fan-in
  'c2-d2': SequenceDiagram,        // cliente → middleware → APIs
  'a1-d1': PublicSurface,          // superficie pública vs interior
  'a2-d1': InheritanceVsComposition,
  'a3-d1': DependencyInversion,    // la dirección del import
  'b1-d1': FlowDiagram,            // decisiones
  'b1-d2': ArchitectureDiagram,    // piezas
  'b2-d1': SequenceWithFragments,  // par + alt
  'b3-d1': DiagramComparison,      // qué captura cada tipo
  'c3-d1': AllVsAllSettled,        // qué se pierde cuando una falla
  'c3-d2': ConcurrencyLimit,       // sin techo, la cola se muda
  'd1-d1': ThreeFamilies,          // las 3 familias, con ejemplos de este repo
  'd2-d1': RepositoryPattern,      // negocio → interfaz → fuentes
};
```

El contenido declara **qué** diagrama es; cada plataforma decide **cómo** dibujarlo. Si un id no
tiene componente, la web cae al `<pre>` con el ASCII: nunca se rompe.

**Trade-off:** el vínculo es por string, así que renombrar un id haría desaparecer el SVG *en
silencio*. Por eso [`tests/diagrams.test.ts`](tests/diagrams.test.ts) exige que todo `DiagramItem`
tenga componente, y que no haya componentes huérfanos. La alternativa —un campo `svg:` explícito en
el ítem— era más visible pero metía una noción de la capa web adentro de `content/`.

### El Repository, justificado a posteriori

Cuando existía sólo `JsonProgressStore`, la interfaz `ProgressStore` parecía indirección gratis: una
interfaz con una sola implementación. La web agregó la segunda —`WebProgressStore` sobre
`localStorage`— **sin tocar una línea del contrato ni del código que lo consume**, y las dos entran a
la misma suite de tests:

```ts
describe.each([
  ['MemoryProgressStore', ...],
  ['JsonProgressStore',   ...],   // Node, archivo en disco
  ['WebProgressStore',    ...],   // browser, localStorage
])('%s cumple el contrato ProgressStore', ...)
```

Esa es la diferencia entre una abstracción que pagó y una que no: la segunda implementación llegó sin
renegociar el contrato.

> Detalle: el contrato es **asincrónico** y `localStorage` es sincrónico. Cumplirlo igual es barato
> (`async` envuelve el valor). Al revés —hacer sincrónico el contrato— habría sido imposible: leer un
> archivo en Node no puede ser sincrónico sin bloquear el proceso. Cuando dos implementaciones
> difieren en esto, la interfaz se define por la más restrictiva.

---

## Los patrones del proyecto

Cada uno está comentado en su archivo.

| Patrón | Dónde | Qué resuelve |
|---|---|---|
| **Registry + lazy loading** | [`core/content/registry.ts`](src/core/content/registry.ts) | catálogo de secciones. El `import()` dinámico da lazy-loading en Node **y** code-splitting en el browser, con el mismo código |
| **Strategy / dispatch table** | [`cli/handlers/`](src/cli/handlers/index.ts) · [`web/src/items/`](web/src/items/ItemView.tsx) | un archivo por tipo de ítem. Un tipo mapeado obliga a cubrir todos los `kind`: si agregás uno, el compilador te frena en **los dos** frontends |
| **Union discriminada** (no herencia) | [`core/domain/item.ts`](src/core/domain/item.ts) | el contenido queda como datos puros |
| **Repository** | [`core/progress-store.ts`](src/core/progress-store.ts) | tres implementaciones, un contrato |
| **Port & Adapter** | [`cli/io.ts`](src/cli/io.ts) | el motor de la CLI no conoce inquirer; los tests le pasan un `FakeIo` |
| **Composition root** | [`cli/index.ts`](src/cli/index.ts) | único lugar con `new` de cosas concretas |

### Union discriminada vs herencia (el *expression problem*)

`Item` es una unión de 6 interfaces con un campo `kind`, no una jerarquía `abstract class Item`.

|  | Union discriminada (elegido) | Jerarquía de clases |
|---|---|---|
| Agregar un **tipo** nuevo | tocás la unión + 2 dispatch tables | agregás una clase ✅ |
| Agregar una **operación** nueva | agregás una tabla de funciones ✅ | tocás las 6 clases |

No tiene respuesta universal: elegís según qué eje espera crecer. Acá los tipos de ítem son pocos y
estables (6), mientras que las operaciones sobre el contenido son las que crecen — **y la web fue
justamente eso**: una operación nueva ("renderizar en browser") sobre los mismos datos, que no obligó
a tocar ni un ítem. Si el pronóstico hubiera sido al revés, las clases serían la respuesta correcta.

---

## Decisiones técnicas y qué resigné

| Decisión | Gano | Resigno |
|---|---|---|
| **Carpeta `src/core/` + alias `@core`**, no npm workspaces | Cero ceremonia: un `package.json`, un `npm install`, un `npm test` | El límite lo enforcea un test, no el package manager. Escalaría a workspaces con un tercer consumidor o si `core` necesitara versionado propio |
| **`@core` sólo en la web; la CLI usa imports relativos** | El bundler resuelve el alias en build. `tsc` **no** reescribe paths al emitir, así que un alias en la CLI necesitaría `tsc-alias` o el campo `imports` de Node | La CLI paga con rutas `../../core/...`. Es fricción visual, no técnica |
| **Contenido en `.ts`, no en `.json`** | Tipado al escribir preguntas; template literals para ASCII y snippets sin escapar | Atado al build. Mitigado: el shape lo fija `domain/`, agregar preguntas sigue siendo editar datos |
| **Tailwind v4** | Cada componente se lee solo, sin saltar a otro archivo | JSX ruidoso. CSS modules separa mejor pero son dos archivos por componente |
| **Highlighter propio de ~50 líneas** | Cero dependencias y cero bundle por algo decorativo. El orden de las alternativas de la regex *es* la lógica | No es un parser: puede tokenizar mal un caso raro. Con TS genérico o JSX en el contenido, la respuesta correcta sería Shiki |
| **`react-router`** | URLs linkeables, botón Atrás, recargar sin perder el lugar | Una dependencia y algo de config |
| **`useReducer`, no `useState` suelto** | Las transiciones de la sesión son explícitas y el reducer es puro y testeable aparte | Más ceremonia que `useState` para un flujo de 3 acciones |
| **Diagramas con *bleed*** (`xl:-mx-32`) | El diagrama de secuencia tiene tipografía de 10 unidades sobre un viewBox de 700: en una columna de 500px renderiza a ~7px reales | Rompe la grilla de la página en pantallas anchas. Los diagramas piden ancho; el texto, medida corta |
| **Guardar al terminar el nivel**, no ítem por ítem | El nivel es la unidad de trabajo; el archivo queda simple | Si cerrás a mitad de un nivel, perdés ese nivel |
| **Sin dark mode** | Menos superficie, contraste garantizado | Habría que duplicar la paleta de los SVG, donde el color codifica significado |

---

## Cómo agregar contenido

1. Creá `src/core/content/<seccion>/level-N.ts` exportando un `Level`.
2. Importalo en el `index.ts` de la sección.
3. Si es una sección nueva, cambiá su entrada en `registry.ts` de `pending` a `ready`.
4. Si agregaste un `DiagramItem`, sumá su componente en `web/src/diagrams/index.ts`.
5. `npm test`.

Los tests de contenido chequean ids duplicados, multiple choice sin correcta o con más de una,
explicaciones vacías, niveles sin ítems puntuables, diagramas sin SVG y SVGs huérfanos. **No hay que
tocar nada del motor, ni de la CLI, ni de la web.**

---

## Fuera de alcance (a propósito)

Modo repaso (rehacer sólo las falladas), estadísticas históricas, ejecutar de verdad los snippets, y
sincronizar el progreso entre la CLI y la web. Ninguno requiere cambiar la arquitectura: el modo
repaso se apoya en los `id` de los ítems, y la sincronización sería una cuarta implementación de
`ProgressStore`.
