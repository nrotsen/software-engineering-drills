import type { Level } from '../../domain/section.js';

export const level1: Level = {
  level: 1,
  title: 'Qué es un patrón y las 3 familias',
  goal: 'Al terminar vas a poder ubicar cualquier patrón en su familia a partir del problema que resuelve, y reconocerlos en código que no usa una sola clase.',
  items: [
    {
      id: 'd1-t0',
      kind: 'theory',
      title: 'Un patrón es un nombre, no un código',
      body: 'Un patrón es una solución conocida a un problema recurrente, con un nombre. Y el valor está más en el NOMBRE que en la solución: decir "esto es un Adapter" comunica en dos palabras lo que si no te costaría un párrafo, y le anticipa al que lee dónde va a estar la complejidad. Son vocabulario de diseño, no una librería que se instala.',
      analogy:
        'Decir "pase y pared". Nadie explica la jugada cada vez: el nombre alcanza y los dos saben qué va a pasar. Si hubiera que describir el movimiento entero antes de cada jugada, se jugaría mucho más lento.',
    },
    {
      id: 'd1-q1',
      kind: 'multipleChoice',
      prompt: '¿Qué es un patrón de diseño?',
      choices: [
        {
          text: 'Una solución conocida a un problema recurrente, con un nombre que funciona como vocabulario compartido.',
          correct: true,
          why: 'Las dos partes importan. La solución te ahorra pensarla de cero; el nombre te ahorra explicarla, que en un equipo termina siendo lo más caro.',
        },
        {
          text: 'Un fragmento de código reutilizable que copiás y adaptás a tu caso.',
          correct: false,
          why: 'Los patrones son estructuras, no código. La implementación concreta cambia con el lenguaje: copiar la versión canónica de un libro de Java a TypeScript produce clases donde alcanzaban funciones.',
        },
        {
          text: 'Una regla de diseño que hay que cumplir para que el código sea profesional.',
          correct: false,
          why: 'No son reglas: son opciones con costo. Tratarlos como reglas es lo que produce el CRUD con cinco capas de abstracción que nadie puede seguir.',
        },
        {
          text: 'Una característica del lenguaje que resuelve un problema común.',
          correct: false,
          why: 'Casi al revés: muchos patrones existen para compensar lo que un lenguaje NO tiene. En JS, Strategy es pasar una función; en Java necesitás una interfaz y clases. Cuando el lenguaje mejora, el patrón se vuelve invisible.',
        },
      ],
      takeaway: 'El nombre es la mitad del valor.',
    },
    {
      id: 'd1-t1',
      kind: 'theory',
      title: 'Creacionales: ¿cómo se crea esto?',
      body: 'Separan la decisión de QUÉ objeto construir del código que lo usa. Aparecen cuando construir algo requiere decisiones —qué implementación, con qué config, cuántas instancias— y no querés esa decisión repetida en cada lugar que hace new. Los más comunes: Factory, Builder, Singleton.',
      analogy:
        'El mostrador de una casa de repuestos. Pedís "la correa para este modelo" y el que atiende decide qué caja bajar del depósito. Vos no aprendés el catálogo: la decisión está concentrada en el mostrador.',
    },
    {
      id: 'd1-t2',
      kind: 'theory',
      title: 'Estructurales: ¿cómo encajan estas piezas?',
      body: 'Componen objetos para formar estructuras más grandes, casi siempre resolviendo una incompatibilidad o agregando una capa sin tocar lo que ya existe. La relación que definen es ESTÁTICA: se decide al armar la estructura, no en cada ejecución. Los más comunes: Adapter, Decorator, Facade, Proxy.',
      analogy:
        'El adaptador de enchufe cuando viajás. No cambia el aparato ni la pared: se pone en el medio y traduce. Toda esta familia es, en el fondo, algo que se pone en el medio.',
    },
    {
      id: 'd1-t3',
      kind: 'theory',
      title: 'De comportamiento: ¿cómo colaboran y quién decide?',
      body: 'Reparten responsabilidades y definen cómo se comunican los objetos en tiempo de EJECUCIÓN. Es la familia más grande y la que más aparece en backend, porque casi todo problema de negocio termina siendo "esto varía según el caso". Los más comunes: Strategy, Observer, Command, State, Template Method.',
      analogy:
        'Las reglas de una reunión: quién habla, quién decide, a quién se le avisa. No cambian quiénes están en la sala —eso es estructura— sino cómo interactúan.',
    },
    {
      id: 'd1-d1',
      kind: 'diagram',
      title: 'Las 3 familias, por el problema que resuelven',
      ascii: `
                        ¿QUÉ PROBLEMA TENÉS?

  ┌────────────────────┐┌────────────────────┐┌────────────────────┐
  │   CREACIONALES     ││   ESTRUCTURALES    ││  DE COMPORTAMIENTO │
  ├────────────────────┤├────────────────────┤├────────────────────┤
  │ ¿cómo se crea      ││ ¿cómo encajan      ││ ¿cómo colaboran    │
  │  esto?             ││  estas piezas?     ││  y quién decide?   │
  ├────────────────────┤├────────────────────┤├────────────────────┤
  │ Factory            ││ Adapter            ││ Strategy           │
  │ Builder            ││ Decorator          ││ Observer           │
  │ Singleton          ││ Facade             ││ Command            │
  │ Prototype          ││ Proxy              ││ State              │
  │                    ││ Composite          ││ Template Method    │
  └────────────────────┘└────────────────────┘└────────────────────┘
     el momento de          la relación            la conversación
     la CREACIÓN            ESTÁTICA               en RUNTIME

  en ESTE repo:          en ESTE repo:          en ESTE repo:
  content/registry.ts    cli/inquirer-io.ts     cli/handlers/index.ts
  (Registry + factories) (adapta inquirer al    (dispatch table por
                          puerto Io)             kind = Strategy)
`,
      caption:
        'Las familias no se distinguen por cómo se escriben sino por qué problema resuelven, y por eso un mismo archivo puede tener piezas de dos. La fila de abajo son ejemplos vivos de este proyecto: ninguno se llama "SomethingFactory" ni tiene un getInstance(), y los tres son patrones de manual.',
    },
    {
      id: 'd1-q2',
      kind: 'multipleChoice',
      prompt: '¿A qué familia pertenece Adapter, y por qué?',
      choices: [
        {
          text: 'Estructural: resuelve cómo encajan dos piezas con interfaces incompatibles, sin cambiar ninguna de las dos.',
          correct: true,
          why: 'El problema que resuelve es de forma, no de creación ni de decisión en runtime. La relación queda fijada al armar la estructura.',
        },
        {
          text: 'De comportamiento, porque cambia cómo se comunican los objetos.',
          correct: false,
          why: 'Es la trampa más razonable: el Adapter sí interviene en la comunicación. Pero lo que define a la familia estructural es que la relación es ESTÁTICA — se decide al cablear, no en cada ejecución.',
        },
        {
          text: 'Creacional, porque hay que construir el adaptador.',
          correct: false,
          why: 'Todos los patrones crean objetos en algún momento; eso no los hace creacionales. Un patrón es creacional cuando el problema ES la creación.',
        },
        {
          text: 'Depende: si adapta una clase es estructural, si adapta una función es de comportamiento.',
          correct: false,
          why: 'La familia la define el problema, no la unidad de código. Un Adapter escrito como una función sigue siendo estructural.',
        },
      ],
    },
    {
      id: 'd1-q3',
      kind: 'multipleChoice',
      prompt:
        'Tu app exporta reportes en CSV, PDF y XLSX, y el roadmap dice que van a agregar más formatos. ¿Qué familia mirás primero?',
      choices: [
        {
          text: 'De comportamiento: el problema es que el algoritmo de exportación varía y hay que poder elegirlo en runtime.',
          correct: true,
          why: 'La forma del problema es "esto varía según el caso", que es Strategy. Ese es el eje principal; lo demás se acomoda alrededor.',
        },
        {
          text: 'Creacionales: hay que crear el exportador correcto según el formato.',
          correct: false,
          why: 'Es media respuesta y una trampa buena: sí vas a necesitar decidir cuál instanciar, y en la práctica una Factory acompaña al Strategy. Pero es el problema secundario. Si lo tomás como principal, terminás con una factory prolija que devuelve siempre lo mismo y un switch de comportamiento intacto.',
        },
        {
          text: 'Estructurales: hay que envolver una librería de PDF con una API rara.',
          correct: false,
          why: 'Puede aparecer un Adapter dentro de UNA de las implementaciones, pero es un detalle de esa implementación, no la forma del problema general.',
        },
        {
          text: 'Ninguna: con un switch alcanza.',
          correct: false,
          why: 'Con tres formatos y ninguno más planeado sería una respuesta correcta. El enunciado dice que van a agregar más, y ahí el switch se convierte en el lugar que hay que tocar siempre — y nunca es uno solo.',
        },
      ],
    },
    {
      id: 'd1-tf1',
      kind: 'trueFalse',
      statement:
        'Los patrones de diseño son de los 90 y en JavaScript moderno ya no aplican.',
      answer: false,
      why: 'Cambia la IMPLEMENTACIÓN, no el problema. En JS, Strategy es pasar una función en vez de armar una jerarquía de clases; Observer es un EventEmitter; Singleton es un módulo, porque los módulos ES ya se evalúan una sola vez por proceso. El patrón sigue ahí y más barato. Lo que sí es cierto: traducir literalmente el UML del libro de la Gang of Four —pensado para C++ y Java de los 90— produce ceremonia sin beneficio. Copiar el diagrama es el error; entender qué problema resuelve, no.',
    },
    {
      id: 'd1-tf2',
      kind: 'trueFalse',
      statement: 'Todo patrón de diseño se implementa con clases.',
      answer: false,
      why: 'El patrón es la ESTRUCTURA de la solución, no el mecanismo del lenguaje. La dispatch table del motor de esta misma app —un objeto que mapea kind a función— es Strategy sin una sola clase, y el tipo mapeado de TypeScript le agrega exhaustividad, que es algo que en Java tendrías que conseguir con una interfaz y disciplina. Insistir con clases porque "así está en el libro" agrega ceremonia y no agrega garantías.',
    },
    {
      id: 'd1-c1a',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el patrón PRINCIPAL en este código, y a qué familia pertenece?',
      snippet: `
export const registry: Readonly<Record<SectionId, SectionEntry>> = {
  concurrency: {
    id: 'concurrency',
    status: 'ready',
    load: () => import('./concurrency/index.js').then((m) => m.section),
  },
  // ...
};

export function loadSection(id: SectionId): Promise<Section> {
  const entry = registry[id];
  return entry.load();
}
`,
      choices: [
        {
          text: 'Registry con factory functions (creacional).',
          correct: true,
          why: 'Concentra en un solo lugar la decisión de qué existe y cómo se construye. Es un patrón creacional aunque no aparezca ninguna clase.',
        },
        {
          text: 'Strategy indexado por id (de comportamiento).',
          correct: false,
          why: 'Strategy es cuando el ALGORITMO varía en runtime según el caso. Acá el algoritmo es siempre el mismo (`entry.load()`); lo que varía es qué módulo se importa. Eso es creación.',
        },
        {
          text: 'Adapter para imports dinámicos (estructural).',
          correct: false,
          why: 'No hay una interfaz externa incompatible que se esté traduciendo. Es una fábrica indexada, no un traductor.',
        },
        {
          text: 'Facade sobre el sistema de módulos (estructural).',
          correct: false,
          why: 'Facade agrupa un subsistema de varias piezas detrás de una API única. Acá hay un solo tipo de operación (cargar), indexada por id.',
        },
      ],
    },
    {
      id: 'd1-c1b',
      kind: 'multipleChoice',
      prompt: 'Además del Registry, ¿qué otro patrón aparece cuando se agrega la caché?',
      snippet: `
const cache = new Map<SectionId, Promise<Section>>();

export function loadSection(id: SectionId): Promise<Section> {
  const entry = registry[id];
  let pending = cache.get(id);
  if (!pending) {
    pending = entry.load();
    cache.set(id, pending);
  }
  return pending;
}
`,
      choices: [
        {
          text: 'Singleton por clave (una instancia por id).',
          correct: true,
          why: 'Singleton NO requiere una clase con `getInstance()`. La estructura "una instancia por clave, compartida entre llamadas" es la esencia del patrón.',
        },
        {
          text: 'Proxy: intercepta accesos a la sección real.',
          correct: false,
          why: 'Proxy es cuando SUSTITUÍS una interfaz idéntica para interponer control. Acá `loadSection` no imita la firma de otro objeto; es su propia función.',
        },
        {
          text: 'Flyweight: comparte instancias inmutables por hash.',
          correct: false,
          why: 'Flyweight optimiza memoria compartiendo objetos DE GRANO FINO idénticos (glifos, tiles). Acá cada sección es única y grande, no se comparte para ahorrar espacio.',
        },
        {
          text: 'Prototype: clona una sección base bajo demanda.',
          correct: false,
          why: 'Prototype es clonar. Acá no se clona nada: se reusa la misma promesa.',
        },
      ],
    },
    {
      id: 'd1-c1c',
      kind: 'multipleChoice',
      prompt: '¿Por qué cuesta reconocer los patrones en este código?',
      choices: [
        {
          text: 'El patrón está en la ESTRUCTURA, no en la nomenclatura.',
          correct: true,
          why: 'En código real los patrones aparecen combinados y sin nombres delatores. Reconocerlos requiere leer la estructura, no buscar palabras.',
        },
        {
          text: 'Porque JS usa closures y prototipos en vez de clases explícitas.',
          correct: false,
          why: 'La razón real no es el mecanismo del lenguaje: los patrones también viven fuera de las clases en Java o C#. Cuesta reconocerlos por la nomenclatura ausente, no por closures.',
        },
        {
          text: 'Porque no aplican los UML canónicos de la Gang of Four.',
          correct: false,
          why: 'El UML es una notación, no una condición para que exista el patrón. Copiarlo produce ceremonia sin beneficio; ausentarlo no oculta el patrón — sólo lo hace menos delator.',
        },
        {
          text: 'Porque el código combina tres patrones en doce líneas.',
          correct: false,
          why: 'Los patrones combinados aparecen todo el tiempo en código real. La combinación no es lo que dificulta el reconocimiento; la falta de nombres delatores sí.',
        },
      ],
      takeaway: 'En código real los patrones se COMBINAN y no se anuncian. Se reconocen por estructura, no por sufijos como "Factory" o "Manager".',
    },
    {
      id: 'd1-q4',
      kind: 'multipleChoice',
      prompt:
        '¿Cuál es la diferencia entre un patrón de diseño, un principio (como SOLID) y un estilo de arquitectura (como hexagonal)?',
      choices: [
        {
          text: 'Es una cuestión de escala: el principio dice hacia dónde ir, el patrón es una solución concreta y nombrada a un problema puntual, y el estilo organiza el sistema entero.',
          correct: true,
          why: 'Y se relacionan hacia arriba: muchos patrones son formas concretas de cumplir un principio (Strategy cumple Open/Closed), y muchos estilos son un conjunto de patrones más reglas sobre los límites.',
        },
        {
          text: 'Son lo mismo, con nombres distintos según la moda de cada época.',
          correct: false,
          why: 'Operan a escalas distintas, y mezclarlos produce discusiones donde nadie se entiende: alguien defiende una decisión de un archivo con un argumento de arquitectura del sistema.',
        },
        {
          text: 'El principio es teoría y el patrón es la práctica.',
          correct: false,
          why: 'Los principios son perfectamente prácticos —"mirá la dirección de los imports" es una acción concreta— y los patrones tienen su parte conceptual. La distinción no es teoría contra práctica.',
        },
        {
          text: 'Un estilo de arquitectura es simplemente un conjunto de patrones.',
          correct: false,
          why: 'Tiene algo de cierto (la arquitectura hexagonal se apoya en Port & Adapter) pero se queda corto: el estilo define además los límites del sistema, la dirección permitida de las dependencias y qué se despliega junto.',
        },
      ],
    },
  ],
  summary: [
    'Un patrón es una solución con NOMBRE. El nombre es la mitad del valor: comunica en dos palabras.',
    'Creacionales: el problema es la CREACIÓN. Factory, Builder, Singleton.',
    'Estructurales: el problema es cómo ENCAJAN las piezas, y la relación es estática. Adapter, Decorator, Facade, Proxy.',
    'De comportamiento: el problema es cómo COLABORAN en runtime. Strategy, Observer, Command, State.',
    'Los patrones no requieren clases: en JS, Strategy es una función y Singleton es un módulo.',
    'En código real aparecen combinados y sin nombres delatores. Se reconocen por la estructura, no por la nomenclatura.',
    'Principio (hacia dónde) ≠ patrón (solución puntual) ≠ estilo de arquitectura (el sistema entero).',
  ],
};
