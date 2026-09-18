import type { Level } from '../../domain/section.js';

export const level2: Level = {
  level: 2,
  title: 'Clase vs objeto, composición y contratos',
  goal: 'Al terminar vas a poder detectar una herencia forzada en un code review y proponer el refactor a composición con un argumento concreto.',
  items: [
    {
      id: 'a2-t1',
      kind: 'theory',
      title: 'Clase vs objeto (y cuándo la distinción se vuelve un bug)',
      body: 'La clase es el molde: define qué campos y métodos van a existir. El objeto es la instancia: tiene valores concretos y su propia identidad. Dicho así suena trivial, y lo es — hasta que aparecen los estáticos. Ahí la pregunta "esto vive en la clase o en la instancia" deja de ser académica y decide si tenés un bug de datos cruzados entre usuarios.',
      analogy:
        'El plano de un departamento contra el departamento. Podés construir cien con el mismo plano; si rompés una pared en el 3ºB, los otros noventa y nueve no se enteran. Pero si el plano dice "todos comparten la misma caldera", eso es un static: un problema en la caldera los afecta a todos al mismo tiempo.',
    },
    {
      id: 'a2-q1',
      kind: 'multipleChoice',
      prompt:
        'En un backend Node que atiende muchos requests concurrentes, ¿qué riesgo real tiene guardar estado mutable en una propiedad static de una clase?',
      choices: [
        {
          text: 'Lo comparten todas las instancias y todos los requests del proceso: dos requests concurrentes pueden pisarse los datos.',
          correct: true,
          why: 'static vive en la clase, y la clase es una sola en todo el proceso. Con el event loop intercalando requests, el request B puede leer lo que dejó el request A entre dos await. Es el bug de "vi los datos de otro usuario", y es imposible de reproducir con un solo request.',
        },
        {
          text: 'Ninguno: cada request crea su propia instancia, así que cada uno tiene su copia.',
          correct: false,
          why: 'Justamente esa es la confusión que el principio quiere evitar. Crear una instancia nueva no te da una copia del static: el static nunca estuvo en la instancia.',
        },
        {
          text: 'Sólo importa si usás cluster o worker_threads.',
          correct: false,
          why: 'Al revés de lo que sugiere: con varios procesos cada uno tiene su propia copia, lo que puede ESCONDER el bug o hacerlo intermitente. Dentro de un mismo proceso ya te pisás sin ningún worker.',
        },
        {
          text: 'Es un problema de performance por contención, no de correctitud.',
          correct: false,
          why: 'JS es monohilo, así que no hay contención de locks. El problema es puramente de correctitud: leer o escribir datos que pertenecen a otra request.',
        },
      ],
      takeaway:
        'static en un servidor = estado global del proceso. Sirve para constantes y caches deliberadas, no para "lo guardo acá mientras proceso".',
    },
    {
      id: 'a2-t2',
      kind: 'theory',
      title: 'El costo real de la herencia',
      body: 'Heredar te da reuso inmediato y te ata a la clase base para siempre. Tres costos concretos: heredás toda la superficie pública, incluida la que no querías; un cambio en la base puede romper subclases que no escribiste vos; y la jerarquía es UNA sola dimensión, mientras que los problemas reales tienen varias. Cuando aparece la segunda dimensión, el árbol se duplica.',
      analogy:
        'Clasificar empleados como Empleado → Vendedor → VendedorSenior. Un día aparece la dimensión "remoto o presencial". Ahora necesitás VendedorSeniorRemoto y VendedorSeniorPresencial, y lo mismo en cada rama: el árbol se duplica entero. Con composición, "remoto" es un atributo que cualquier empleado TIENE, no una rama nueva.',
    },
    {
      id: 'a2-d1',
      kind: 'diagram',
      title: 'Herencia vs composición, en un diagrama de clases',
      ascii: `
HERENCIA  (es-un)                      COMPOSICIÓN  (tiene-un)

  ┌──────────────────┐                  ┌────────────────────┐
  │    ApiClient     │                  │    UserService     │
  ├──────────────────┤                  ├────────────────────┤
  │ + get()          │                  │ - api: ApiClient   │◆──┐
  │ + post()         │                  ├────────────────────┤   │
  │ # baseUrl        │                  │ + findById()       │   │
  └────────▲─────────┘                  └────────────────────┘   │
           │ extends                                             │ usa
  ┌────────┴─────────┐                  ┌────────────────────┐   │
  │   UserService    │                  │     ApiClient      │◀──┘
  ├──────────────────┤                  ├────────────────────┤
  │ + findById()     │                  │ + get()            │
  │ + get()      (!) │                  │ + post()           │
  │ + post()     (!) │                  └────────────────────┘
  └──────────────────┘

  (!) heredados sin querer:              La superficie pública de
      userService.post() existe          UserService es SÓLO findById().
      y nadie decidió que existiera.     api es un detalle privado.
`,
      caption:
        'Mismo reuso, distinta superficie. Con herencia, UserService expone get y post a todo el mundo porque no tiene forma de no hacerlo. Con composición decide exactamente qué ofrece. En notación UML, el rombo lleno es "tiene-un" (composición) y el triángulo hueco es "es-un" (herencia): cuando dibujes uno, esa es la primera distinción que va a buscar quien lo lea.',
    },
    {
      id: 'a2-c1a',
      kind: 'multipleChoice',
      prompt: '¿Qué está mal en `AuditLogRepository`?',
      snippet: `
class BaseRepository {
  constructor(protected db: Db, protected table: string) {}
  async findAll() { return this.db.query('SELECT * FROM ' + this.table); }
  async insert(row: unknown) { /* ... */ }
  async deleteAll() { /* ... */ }
}

class AuditLogRepository extends BaseRepository {
  constructor(db: Db) { super(db, 'audit_log'); }
  async findByUser(userId: string) { /* ... */ }
  async deleteAll() {
    throw new Error('los logs de auditoría no se borran');
  }
}
`,
      choices: [
        {
          text: 'Sobreescribe `deleteAll` con un `throw`: viola LSP.',
          correct: true,
          why: 'Olor infalible de herencia forzada: una subclase que sobreescribe para deshabilitar (throw, return null, no-op). Es violación del principio de sustitución de Liskov (LSP).',
        },
        {
          text: '`protected db` y `table` filtran acoplamiento a toda la jerarquía.',
          correct: false,
          why: 'Es un problema secundario (base frágil), pero no la violación central. Lo grave es sobreescribir un método para deshabilitarlo.',
        },
        {
          text: '`BaseRepository` debería ser `abstract`, no instanciable.',
          correct: false,
          why: '`abstract` no arregla que una subclase promete `deleteAll` en el tipo y en runtime lo tira. El bug es la relación forzada.',
        },
        {
          text: '`insert` acepta `unknown`, rompiendo el tipado del row.',
          correct: false,
          why: 'Es un olor de tipado laxo, pero ortogonal al problema de sustitución. La subclase igual tira aunque `insert` estuviera tipado prolijo.',
        },
      ],
    },
    {
      id: 'a2-c1b',
      kind: 'multipleChoice',
      prompt: '¿Cómo lo re-escribís con composición?',
      choices: [
        {
          text: 'Delegar en un `Table` inyectado y NO exponer `deleteAll`.',
          correct: true,
          why: 'La superficie pública queda exactamente lo que decidiste ofrecer. Si alguien llama `auditRepo.deleteAll()` es error de compilación, no de runtime.',
        },
        {
          text: 'Mover `deleteAll` a una subclase `DeletableRepository`.',
          correct: false,
          why: 'Sigue siendo herencia. Cualquier función que reciba una `BaseRepository` sigue teniendo el mismo problema conceptual: no todas las bases tienen `deleteAll`.',
        },
        {
          text: 'Cambiar el `throw` por un `return null` silencioso.',
          correct: false,
          why: 'Peor: un método que "no hace nada" y devuelve null miente en silencio. El tipo dice que borra, y no borra.',
        },
        {
          text: 'Dividir la base en `ReadRepository` + `WriteRepository` y extender sólo la de lectura.',
          correct: false,
          why: 'Va en la dirección correcta (Interface Segregation) pero sigue siendo herencia. Mismo problema si mañana una base cambia. Composición es más simple y explícita.',
        },
      ],
    },
    {
      id: 'a2-c1c',
      kind: 'multipleChoice',
      prompt: '¿Qué ganás además de mover el error a compilación?',
      choices: [
        {
          text: 'Superficie pública explícita y menos acoplamiento con el estado de la base.',
          correct: true,
          why: 'Con composición, la comunicación es una llamada a un método público: superficie chica y explícita. Cambios en la base dejan de romper hijos silenciosamente.',
        },
        {
          text: 'Menos líneas de código y menos archivos.',
          correct: false,
          why: 'Suele ser parecido o incluso un poco más. La ganancia es EN CLARIDAD y en costos futuros, no en LOC.',
        },
        {
          text: 'Menos dispatch dinámico: mejor performance en el hot path.',
          correct: false,
          why: 'La performance es prácticamente idéntica. El costo es de mantenimiento y correctitud, no de CPU.',
        },
        {
          text: 'Poder pasarla como argumento a funciones que reciben `BaseRepository`.',
          correct: false,
          why: 'Justo lo CONTRARIO: la clase deja de ser sustituible por `BaseRepository` — y eso es lo que querés, porque nunca lo fue de verdad.',
        },
      ],
      takeaway: 'Sobreescribir un método base con `throw`, `return null` o no-op es el síntoma más confiable de herencia forzada. LSP violado.',
    },
    {
      id: 'a2-q2',
      kind: 'multipleChoice',
      prompt: '¿En cuál de estos casos la herencia es la opción correcta?',
      choices: [
        {
          text: 'Una jerarquía de errores: class PaymentFailed extends DomainError extends Error.',
          correct: true,
          why: 'Es-un genuino y sustituible: todo lo que sirve para un Error sirve para un PaymentFailed (instanceof, .message, .stack, el catch). La base es estable, casi no tiene comportamiento propio, y el runtime ya trata a los errores polimórficamente.',
        },
        {
          text: 'AdminUser extends User, para agregarle los permisos de administrador.',
          correct: false,
          why: 'Suele fallar porque el rol es un atributo que cambia en RUNTIME —a un usuario lo hacen admin— y con herencia el tipo queda fijo en el momento de construir el objeto. No podés "convertir" un User en AdminUser. Composición: user.roles.',
        },
        {
          text: 'CachedUserRepository extends UserRepository, para agregarle caché.',
          correct: false,
          why: 'Tentador, y acopla el caché a UNA implementación concreta: si mañana aparece un repo en Mongo, necesitás CachedMongoUserRepository. Composición (el patrón Decorator, Sección D): new CachedRepository(cualquierRepo) funciona con todos.',
        },
        {
          text: 'SqlUserRepository extends BaseRepository, para no repetir el armado de queries.',
          correct: false,
          why: 'Reuso de código, no relación de tipos — es exactamente el caso del ejercicio anterior. Si el armado de queries es valioso, es un colaborador (QueryBuilder) que los repos USAN.',
        },
      ],
    },
    {
      id: 'a2-tf1',
      kind: 'trueFalse',
      statement:
        '"Favorecé composición sobre herencia" quiere decir que la herencia es un error de diseño y hay que evitarla siempre.',
      answer: false,
      why: '"Favorecé" es una preferencia por defecto, no una prohibición. La herencia es correcta cuando la relación es genuinamente es-un Y la subclase es sustituible por la base. Dónde brilla: jerarquías de errores, tipos de dominio cerrados y estables, y frameworks que directamente te piden extender una clase base. La razón de la preferencia es una asimetría de costos: si elegís composición y te sobraba flexibilidad, no pasa nada; si elegís herencia y te falta, el refactor te toca a vos y a todos los que ya heredaron de esa clase.',
    },
    {
      id: 'a2-t3',
      kind: 'theory',
      title: 'Interfaces: el contrato',
      body: 'Una interfaz dice qué mensajes entiende un objeto, sin decir nada de cómo los responde. Programar contra la interfaz y no contra la implementación es lo que te deja cambiar el motor sin cambiar el auto. En TypeScript hay un detalle que cambia cómo se usan: el tipado es ESTRUCTURAL. Nada tiene que declararse compatible; alcanza con tener la forma correcta.',
      analogy:
        'Un enchufe tipo C. La norma dice dónde van los agujeros y qué voltaje sale; ningún fabricante tiene que registrarse en una lista de "aparatos compatibles". Si tu ficha entra, entra. En TS: si el objeto tiene los métodos, sirve.',
    },
    {
      id: 'a2-tf2',
      kind: 'trueFalse',
      statement:
        'En TypeScript, una clase tiene que declarar implements Foo para poder usarse donde se espera un Foo.',
      answer: false,
      why: 'TS tipa por ESTRUCTURA, no por nombre (a diferencia de Java o C#, que son nominales). Si la clase tiene los miembros correctos es asignable, haya declarado implements o no. Entonces implements no cambia el tipo: es una AFIRMACIÓN que hacés para que el compilador te marque el error en la clase —y no en cada lugar donde la usás— si te desviaste del contrato. Vale la pena escribirlo justamente por eso: mueve el error al archivo que vas a tener que arreglar. La consecuencia práctica más útil del tipado estructural: en los tests podés pasar un objeto literal { findById: async () => user } como repositorio, sin fixtures ni librerías de mocking.',
    },
    {
      id: 'a2-c2a',
      kind: 'multipleChoice',
      prompt: '¿Qué está mal en cómo `InvoiceService` obtiene sus dependencias?',
      snippet: `
class InvoiceService {
  private repo = new PostgresInvoiceRepository(pool);
  private mailer = new SendgridMailer(process.env.SENDGRID_KEY);

  async issue(orderId: string) {
    const invoice = await this.repo.createFor(orderId);
    await this.mailer.send(invoice.customerEmail, renderInvoice(invoice));
    return invoice;
  }
}
`,
      choices: [
        {
          text: '`new` de infraestructura hardcodeado adentro del dominio.',
          correct: true,
          why: 'Un `new` de dependencia con efectos (DB, red, reloj, FS) dentro de una clase de dominio es casi siempre un error. Esas decisiones pertenecen al composition root de la app.',
        },
        {
          text: '`private` en `repo` y `mailer` impide reemplazarlas en tests.',
          correct: false,
          why: 'El nivel de acceso está bien: no querés que nadie de afuera manipule el repo. El problema es cómo se ELIGEN, no cómo se exponen.',
        },
        {
          text: '`process.env.SENDGRID_KEY` se lee en tiempo de construcción, no de request.',
          correct: false,
          why: 'Ese detalle es real pero secundario. El problema estructural es el acoplamiento a implementaciones concretas.',
        },
        {
          text: '`renderInvoice` está fuera de la clase y debería ser un método.',
          correct: false,
          why: 'Función pura fuera de la clase está bien. No hace falta ceremonia.',
        },
      ],
    },
    {
      id: 'a2-c2b',
      kind: 'multipleChoice',
      prompt: '¿Qué te CUESTA este diseño cuando querés testear `issue()`?',
      choices: [
        {
          text: 'No hay dónde inyectar dobles: el test necesita Postgres y Sendgrid reales.',
          correct: true,
          why: 'Los `new` internos son inevitables: no hay lugar donde inyectar dobles de prueba. Cada test carga una decisión de deployment.',
        },
        {
          text: 'Anda pero tarda: la latencia de red domina cada test.',
          correct: false,
          why: 'El costo real no es velocidad — es que ni siquiera se puede correr sin infra. Un test que no corre localmente ya perdió.',
        },
        {
          text: 'Alcanza con setear `SENDGRID_KEY` a un valor dummy en el `.env` de tests.',
          correct: false,
          why: 'Sendgrid rechaza la key inválida en runtime; el test explota igual. Y aunque no lo hiciera, seguirías dependiendo de la red.',
        },
        {
          text: 'Hay que monkeypatchear el módulo con `jest.mock` para poder correrlo.',
          correct: false,
          why: 'Es una salida técnica que funciona, pero es el síntoma — no el costo. El COSTO es haber diseñado la clase para necesitar ese parche.',
        },
      ],
    },
    {
      id: 'a2-c2c',
      kind: 'multipleChoice',
      prompt: '¿Cómo lo re-escribís?',
      snippet: `
// ¿qué firma le ponés al constructor?
`,
      choices: [
        {
          text: '`constructor(private repo: InvoiceRepository, private mailer: Mailer)`.',
          correct: true,
          why: 'Contratos explícitos en la firma. La clase se lee y ya sabés qué necesita del mundo exterior. Y los tests pasan `{ createFor: async () => fakeInvoice }` sin ceremonia.',
        },
        {
          text: '`constructor(pool: Pool, sendgridKey: string)` para mover la config al composition root.',
          correct: false,
          why: 'Sigue soldado a Postgres y Sendgrid. El test necesita una implementación específica; sólo movió la decisión un poco más arriba.',
        },
        {
          text: '`constructor(deps: { repo: PostgresInvoiceRepository; mailer: SendgridMailer })`.',
          correct: false,
          why: 'Es inyección sin INVERSIÓN: dependés de clases concretas por firma. Los tests necesitan construir esos tipos exactos igual que antes.',
        },
        {
          text: 'Métodos `static` con `repo` y `mailer` como parámetros de cada llamada.',
          correct: false,
          why: 'La clase deja de ser útil como tipo. Y no arregla el acoplamiento: los métodos static suelen instanciar por dentro igual.',
        },
      ],
      takeaway: 'Constructor que declara sus dependencias = clase autodocumentada. Si te pide seis cosas, la clase hace demasiado — te lo dice la firma sin abrir el cuerpo.',
    },
    {
      id: 'a2-c3a',
      kind: 'multipleChoice',
      prompt: '¿Qué te permite este armado con `withCache(withRetry(...))` que una jerarquía de clases NO te permitiría?',
      snippet: `
const repo = withCache(
  withRetry(new PgUserRepository(pool), { attempts: 3 }),
  { ttlMs: 60_000 },
);
`,
      choices: [
        {
          text: 'Cualquier subconjunto y cualquier orden, sin escribir una clase por combinación.',
          correct: true,
          why: 'Caché sí/no × retry sí/no × métricas sí/no × ... explota combinatoriamente. Y el orden (caché por fuera vs adentro del retry) queda congelado en la jerarquía. Composición lo arma en una línea.',
        },
        {
          text: 'Que retry y cache corran concurrentemente para bajar latencia.',
          correct: false,
          why: 'Los decorators corren en secuencia, uno adentro del otro. La ventaja no es concurrencia, es composición.',
        },
        {
          text: 'Preservar los tipos genéricos de `PgUserRepository` al envolverlo.',
          correct: false,
          why: 'La herencia también preserva tipos (`class Cached<T> extends T` no compila pero sí `extends UserRepository`). El beneficio real es la combinatoria de capacidades.',
        },
        {
          text: 'Sustituir el repo por `PgUserRepository` donde se espere la clase concreta.',
          correct: false,
          why: 'Al revés: querés que las funciones esperen la INTERFAZ (`UserRepository`), no la implementación concreta. Si esperan la concreta, el decorator no se puede colar.',
        },
      ],
    },
    {
      id: 'a2-c3b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el trade-off HONESTO de este enfoque?',
      choices: [
        {
          text: 'Indirección: stack traces largos y flujo difícil de seguir.',
          correct: true,
          why: 'El poder tiene costo. Si abusás del patrón, debuggear cinco decorators apilados es peor que leer una clase. La composición no es gratis; es más adecuada.',
        },
        {
          text: 'Cada capa se testea aislada, pero perdés cobertura end-to-end.',
          correct: false,
          why: 'Al contrario: testeás cada capa Y la composición entera. La cobertura no se pierde; hay que sumar un test de integración corto, y ya.',
        },
        {
          text: 'El orden de aplicación es rígido: retry siempre tiene que ir adentro de cache.',
          correct: false,
          why: 'Es al revés: podés intercalar el orden libremente, y ese es JUSTO uno de los beneficios. Con herencia sí quedaría fijo.',
        },
        {
          text: 'Cada decorator debe re-declarar todos los métodos de la interfaz.',
          correct: false,
          why: 'Es un costo real de código, pero menor: `withCache<T extends UserRepository>(r: T): T` con spread lo minimiza. La indirección de runtime es el trade-off más importante.',
        },
      ],
      takeaway: 'Composición = combinaciones en runtime sobre varios ejes. Herencia = combinaciones fijas en compilación sobre uno solo. El trade-off es indirección: usalo con criterio.',
    },
    {
      id: 'a2-q3',
      kind: 'multipleChoice',
      prompt:
        'El test clásico para decidir entre herencia y composición es preguntarse "¿es-un o tiene-un?". ¿Cuál es su principal limitación?',
      choices: [
        {
          text: 'El lenguaje natural miente: "un cuadrado ES un rectángulo" es verdad en geometría y falso en código si el rectángulo es mutable. El test real es la sustituibilidad.',
          correct: true,
          why: 'El caso canónico: si Rectangle tiene setWidth y setHeight, un Square no puede implementarlos sin romper la expectativa de que cambiar el ancho no cambia el alto. La frase suena bien y el código se rompe igual.',
        },
        {
          text: 'Es un buen test, pero sólo aplica a lenguajes con herencia simple.',
          correct: false,
          why: 'Cuánta herencia permita el lenguaje no cambia si la relación es correcta. Con herencia múltiple el mismo error te da los mismos problemas, multiplicados.',
        },
        {
          text: 'No sirve porque en JavaScript no hay clases de verdad, sólo prototipos.',
          correct: false,
          why: 'Hay clases (azúcar sobre prototipos, pero el modelo de tipos que te importa es el de TS). Y la limitación del test es conceptual, no del runtime: existe igual en Java.',
        },
        {
          text: 'Sólo importa en lenguajes tipados; en JS podés cambiar el prototipo en runtime y salir del paso.',
          correct: false,
          why: 'Poder hacerlo no lo vuelve buena idea, y el costo de acoplamiento es idéntico. Parchear el prototipo agrega un problema nuevo: ahora el comportamiento depende de qué archivo se cargó primero.',
        },
      ],
      takeaway:
        'No preguntes "¿es-un?". Preguntá: "¿puedo pasar el hijo a cualquier función que espere al padre sin que se rompa nada?".',
    },
    {
      id: 'a2-q4',
      kind: 'multipleChoice',
      prompt:
        'Definís interface Repository { findAll, findById, insert, update, delete, count, bulkInsert } y todos tus repos la implementan. ¿Cuál es el problema más probable?',
      choices: [
        {
          text: 'Los repos que sólo leen quedan obligados a implementar escrituras que no soportan, normalmente tirando un error.',
          correct: true,
          why: 'Una interfaz gorda arrastra a sus implementaciones. El repo de un catálogo de sólo lectura, o uno que envuelve una API de terceros sin escritura, terminan con métodos que existen para cumplir el tipo y explotan si alguien los llama.',
        },
        {
          text: 'Ninguno: una interfaz común hace que todos los repos sean intercambiables.',
          correct: false,
          why: 'Intercambiables en el TIPO, no en el COMPORTAMIENTO. Los que tiran throw rompen la sustituibilidad, que es justamente lo que la interfaz común prometía. Una promesa que el compilador acepta y el runtime desmiente es peor que no tener la promesa.',
        },
        {
          text: 'Es un problema de performance: la interfaz obliga a cargar métodos que nunca se usan.',
          correct: false,
          why: 'Las interfaces de TS se borran al compilar: no existen en runtime y no cuestan nada. El costo es de diseño y de acoplamiento, no de ejecución.',
        },
        {
          text: 'Habría que usar una clase abstracta en vez de una interfaz, para dar implementaciones por defecto.',
          correct: false,
          why: 'Mueve el problema sin resolverlo: una implementación por defecto que tira o no hace nada tiene exactamente el mismo defecto, ahora con el acoplamiento de la herencia arriba.',
        },
      ],
      takeaway:
        'Interfaces chicas y específicas (UserReader, UserWriter) le ganan a una interfaz grande. Es el principio ISP, del nivel 3.',
    },
  ],
  summary: [
    'static es estado global del proceso: en un servidor concurrente, dos requests se pisan.',
    'La herencia cuesta tres cosas: superficie heredada sin querer, clase base frágil, y una sola dimensión de variación.',
    'Olor infalible de herencia forzada: una subclase que sobreescribe un método para deshabilitarlo.',
    '"Favorecé composición" es una preferencia por defecto, no una prohibición. La herencia brilla en jerarquías estables como los errores.',
    'En TS el tipado es estructural: implements no cambia el tipo, sólo mueve el error al archivo correcto.',
    'new de una dependencia con efectos adentro de una clase de dominio: decisión de infraestructura en el lugar equivocado.',
    'Composición = combinar capacidades en runtime sobre varios ejes. Herencia = combinaciones fijas sobre uno.',
    'El test es-un/tiene-un miente. El test real es la sustituibilidad.',
  ],
};
