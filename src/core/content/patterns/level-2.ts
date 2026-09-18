import type { Level } from '../../domain/section.js';

export const level2: Level = {
  level: 2,
  title: 'Los seis que vas a ver en backend',
  goal: 'Al terminar vas a poder abrir un archivo que no escribiste vos y nombrar el patrón que tiene, incluso cuando no haya ninguna clase.',
  items: [
    {
      id: 'd2-t1',
      kind: 'theory',
      title: 'Singleton',
      body: 'Garantiza que exista una sola instancia de algo y da un punto de acceso a ella. En JS casi no hace falta como patrón explícito: un módulo ES ya es un singleton —se evalúa una vez por proceso y se cachea— así que exportar una instancia alcanza. Es el patrón más abusado de todos, porque resuelve un problema real (una sola conexión al pool) y trae uno enorme de regalo: estado global.',
      analogy:
        'El reloj de la estación. Hay uno solo y todos lo miran, y funciona porque nadie lo cambia. El día que dos personas puedan moverlo, empiezan los problemas.',
    },
    {
      id: 'd2-q1',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
    });
  }
  return pool;
}
`,
      choices: [
        {
          text: 'Singleton',
          correct: true,
          why: 'Una sola instancia por proceso, creada perezosamente la primera vez y compartida después. Es la forma idiomática en JS: no hace falta una clase con getInstance(), alcanza con el scope del módulo. Y acá es un buen uso: un pool de conexiones DEBE ser uno solo, o agotás los slots de la base.',
        },
        {
          text: 'Factory',
          correct: false,
          why: 'Una factory decide QUÉ construir según algún criterio y normalmente devuelve objetos distintos en llamadas distintas. Ésta devuelve siempre el mismo. La confusión es entendible: toda creación perezosa se parece de lejos a una factory.',
        },
        {
          text: 'Repository',
          correct: false,
          why: 'Un repositorio abstrae el acceso a una colección de objetos de DOMINIO (findById, save). Esto devuelve una conexión, que es infraestructura pura y no habla de ningún concepto de negocio.',
        },
        {
          text: 'Adapter',
          correct: false,
          why: 'No hay traducción de interfaces: el Pool se devuelve tal cual, con su API original intacta.',
        },
      ],
    },
    {
      id: 'd2-t2',
      kind: 'theory',
      title: 'Factory',
      body: 'Concentra la decisión de QUÉ objeto construir. En vez de que cada caller haga new de la implementación concreta, se la pide a la factory y ésta decide según el input, la config o el entorno. Lo que ganás no es evitar el new: es que el día que cambie la regla de selección, cambia en un solo lugar.',
      analogy:
        'El mostrador de la casa de repuestos otra vez: pedís por el modelo del auto y el que atiende decide qué caja bajar. Si mañana cambia el proveedor de correas, lo aprende él, no vos.',
    },
    {
      id: 'd2-q2',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
export function createStorage(env: Env): FileStore {
  switch (env.STORAGE_DRIVER) {
    case 's3':    return new S3Store(env.S3_BUCKET);
    case 'gcs':   return new GcsStore(env.GCS_BUCKET);
    case 'local': return new LocalStore(env.TMP_DIR);
  }
}
`,
      choices: [
        {
          text: 'Factory',
          correct: true,
          why: 'Concentra en un solo lugar la decisión de qué implementación construir según la config. El resto de la app recibe un FileStore y nunca se entera de cuál le tocó.',
        },
        {
          text: 'Strategy',
          correct: false,
          why: 'Es la trampa más común y la distinción vale oro: Strategy es que el COMPORTAMIENTO se intercambie en runtime; Factory es que la CREACIÓN esté centralizada. Van casi siempre juntos —esta factory produce lo que después se usa como estrategia— pero el código que ves resuelve la creación, no la ejecución.',
        },
        {
          text: 'Adapter',
          correct: false,
          why: 'No traduce ninguna interfaz: las tres clases ya implementan FileStore. El Adapter estaría adentro de cada una, traduciendo el SDK de S3 o de GCS.',
        },
        {
          text: 'Singleton',
          correct: false,
          why: 'Cada llamada construye una instancia nueva; no hay ninguna garantía de unicidad ni caché.',
        },
      ],
      takeaway: 'Factory = quién decide qué se CONSTRUYE. Strategy = qué comportamiento se EJECUTA.',
    },
    {
      id: 'd2-t3',
      kind: 'theory',
      title: 'Repository',
      body: 'Le da a tu dominio la ilusión de una colección en memoria de objetos de negocio: findById, findByEmail, save. Esconde de dónde salen: Postgres, una API, un archivo, un caché. Lo que compra es que el dominio deje de hablar SQL, y que puedas testear sin base. Lo que NO es: un wrapper uno a uno sobre tu ORM.',
      analogy:
        'El bibliotecario. Le pedís "el libro de tal autor" y aparece. No sabés si estaba en la sala, en el depósito o lo pidió prestado a otra biblioteca — y no querés saberlo.',
    },
    {
      id: 'd2-d1',
      kind: 'diagram',
      title: 'Repository: una interfaz, varias fuentes',
      ascii: `
        ┌────────────────────────────────────┐
        │        LÓGICA DE NEGOCIO           │
        │  InvoiceService · CheckoutService  │
        │                                    │
        │  habla de: User, Order, Invoice    │
        │  NO sabe: SQL, HTTP, archivos      │
        └────────────────┬───────────────────┘
                         │ depende de la INTERFAZ
                         ▼
        ┌────────────────────────────────────┐
        │   interface UserRepository         │
        │     findById(id): User | null      │
        │     findByEmail(e): User | null     │
        │     save(user): void               │
        └───┬──────────┬──────────┬──────────┘
            │          │          │   implementan
            ▼          ▼          ▼
     ┌───────────┐┌──────────┐┌───────────────┐
     │ PgUser    ││ HttpUser ││ InMemoryUser  │
     │ Repository││Repository││ Repository    │
     ├───────────┤├──────────┤├───────────────┤
     │ Postgres  ││ API del  ││ un Map        │
     │           ││ proveedor││ (para tests)  │
     └───────────┘└──────────┘└───────────────┘

     La flecha va del negocio a la INTERFAZ, nunca a una implementación.
`,
      caption:
        'El negocio depende del contrato; las fuentes de datos se cuelgan de él. Dos consecuencias prácticas: podés migrar de Postgres a una API sin tocar el dominio, y los tests corren contra la implementación en memoria en milisegundos en vez de levantar Docker. Fijate que la interfaz vive del lado del NEGOCIO —es la inversión de dependencias de la Sección A, nivel 3— y que en este mismo repo el patrón está aplicado en ProgressStore, con tres implementaciones que pasan la misma suite de tests.',
    },
    {
      id: 'd2-q3',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string) {
    const { rows } = await this.pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [id],
    );
    return rows[0] ? toDomain(rows[0]) : null;
  }
}
`,
      choices: [
        {
          text: 'Repository',
          correct: true,
          why: 'La interfaz habla el lenguaje del DOMINIO (User, findByEmail) y la implementación traduce a SQL. Fijate el toDomain(): esa conversión de fila a objeto de negocio es la marca del patrón. Sin ella tenés un wrapper del ORM con otro nombre.',
        },
        {
          text: 'Adapter',
          correct: false,
          why: 'Trampa razonable y vale la distinción: técnicamente PgUserRepository adapta el pool de pg a la interfaz UserRepository. Pero el Adapter existe para amoldarse a una interfaz PREEXISTENTE que no controlás; acá la interfaz la diseñaste vos desde el dominio, y la fuente se acomoda a ella. La intención es opuesta, y por eso el nombre también.',
        },
        {
          text: 'Facade',
          correct: false,
          why: 'Un Facade simplifica el acceso a un subsistema complejo, pero no le cambia el vocabulario ni pretende parecerse a una colección. Acá el punto es hablar en objetos de dominio.',
        },
        {
          text: 'Factory',
          correct: false,
          why: 'No construye nada según un criterio: consulta y devuelve. El toDomain() crea objetos, pero crear no es el problema que el patrón resuelve.',
        },
      ],
    },
    {
      id: 'd2-tf1',
      kind: 'trueFalse',
      statement:
        'Si envolvés tu ORM en una clase con los mismos métodos (find, findOne, save), ya tenés un Repository.',
      answer: false,
      why: 'Eso es un wrapper, no un Repository. La marca del patrón es que la interfaz habla el lenguaje del DOMINIO (findActiveSubscribersFor(plan)) y que hay una traducción entre la fila y el objeto de negocio. Un "repositorio" con findOne(where) es el ORM con otro nombre y no te desacopla de nada: el día que cambies de ORM, la firma cambia igual y te toca todo el dominio. La prueba de una sola pregunta: ¿podrías implementar esa misma interfaz contra una API HTTP sin cambiarla? Si la respuesta es no, no es un Repository.',
    },
    {
      id: 'd2-t4',
      kind: 'theory',
      title: 'Adapter',
      body: 'Traduce la interfaz que tenés a la interfaz que necesitás, sin tocar ninguna de las dos. Aparece siempre en el borde del sistema: cuando integrás una librería, el SDK de un proveedor o un legacy cuya API no controlás. Su valor concreto y medible: encapsula un cambio de proveedor en un solo archivo.',
      analogy:
        'El adaptador de enchufe. No modificás el aparato ni la pared: metés algo en el medio que traduce, y lo tirás cuando volvés.',
    },
    {
      id: 'd2-q4',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
// Nuestro dominio habla de esto:
export interface Notifier {
  send(to: string, message: string): Promise<void>;
}

// Twilio habla de otra cosa:
export class TwilioNotifier implements Notifier {
  constructor(private readonly client: Twilio) {}

  async send(to: string, message: string) {
    await this.client.messages.create({
      to,
      from: process.env.TWILIO_FROM,
      body: message,
    });
  }
}
`,
      choices: [
        {
          text: 'Adapter',
          correct: true,
          why: 'Traduce la API externa (messages.create con from y body) a la interfaz que definió tu dominio (send(to, message)). El día que migren de Twilio a otro proveedor, este archivo es el único que se toca, y nada del dominio se entera.',
        },
        {
          text: 'Facade',
          correct: false,
          why: 'Un Facade también simplifica, pero sobre un subsistema propio y sin un contrato preexistente al que amoldarse. Acá hay una interfaz destino explícita (Notifier), y amoldarse a ella es lo que lo hace Adapter.',
        },
        {
          text: 'Strategy',
          correct: false,
          why: 'Habría Strategy si algo eligiera en runtime entre varios Notifier según un criterio. Este archivo sólo traduce uno; el Strategy sería el código que elige cuál usar.',
        },
        {
          text: 'Decorator',
          correct: false,
          why: 'Un Decorator implementa la MISMA interfaz que envuelve y le agrega comportamiento. Acá las dos interfaces son distintas: eso es traducir, no decorar.',
        },
      ],
      takeaway: 'Adapter: interfaces DISTINTAS. Decorator: la MISMA interfaz, con algo agregado.',
    },
    {
      id: 'd2-t5',
      kind: 'theory',
      title: 'Strategy',
      body: 'Encapsula un algoritmo detrás de un contrato para poder intercambiarlo en runtime. Es el patrón que reemplaza un switch sobre un tipo por polimorfismo, y en JS su forma más barata es pasar una función. Lo que ganás: agregar un caso pasa a ser agregar un archivo en vez de editar el switch que ya funciona y está probado.',
      analogy:
        'El GPS con modos: más rápido, más corto, evitar peajes. El auto es el mismo y el destino también; lo único que cambia es el algoritmo que elige el camino, y lo elegís vos en el momento.',
    },
    {
      id: 'd2-q5',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
type PricingRule = (order: Order) => number;

const rules: Record<CustomerTier, PricingRule> = {
  standard:  (o) => o.subtotal,
  premium:   (o) => o.subtotal * 0.9,
  wholesale: (o) => o.subtotal * 0.75 - o.items.length * 50,
};

export function priceFor(order: Order, tier: CustomerTier) {
  return rules[tier](order);
}
`,
      choices: [
        {
          text: 'Strategy',
          correct: true,
          why: 'Cada regla es un algoritmo intercambiable detrás del mismo contrato (Order → number), y se elige en runtime por el tier. No hay una sola clase y sigue siendo Strategy: en JS, las funciones de primera clase son la implementación más barata del patrón.',
        },
        {
          text: 'Factory',
          correct: false,
          why: 'Una factory devolvería la regla para que otro la ejecute después. Acá el mapa se indexa y se ejecuta en el acto: el problema resuelto es qué comportamiento correr, no qué construir.',
        },
        {
          text: 'Command',
          correct: false,
          why: 'Un Command encapsula una ACCIÓN con sus argumentos, como objeto, para poder guardarla, encolarla o deshacerla. Estas son funciones de cálculo puro que se ejecutan ya mismo y no se guardan en ningún lado.',
        },
        {
          text: 'Template Method',
          correct: false,
          why: 'Ése define el esqueleto de un algoritmo en una base y deja huecos para que las subclases los completen. Acá no hay esqueleto compartido ni herencia: cada regla es independiente de las otras.',
        },
      ],
    },
    {
      id: 'd2-t6',
      kind: 'theory',
      title: 'Observer',
      body: 'Permite avisar que pasó algo sin saber quién está escuchando. El emisor publica un evento y los interesados se suscriben. Lo que ganás es desacople en una dirección: agregar un consumidor nuevo no toca al emisor. Lo que pagás es que el flujo deja de ser visible leyendo el código del emisor.',
      analogy:
        'La lista de correo del barrio. El que manda el aviso no sabe quiénes están anotados, y sumar un vecino no le cambia nada. La contra es la misma: si algo sale mal, nadie sabe con certeza quién lo recibió.',
    },
    {
      id: 'd2-q6',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este?',
      snippet: `
class OrderService extends EventEmitter {
  async place(input: OrderInput) {
    const order = await this.repo.insert(input);
    this.emit('order.placed', order);
    return order;
  }
}

orderService.on('order.placed', (o) => analytics.track('order_placed', o));
orderService.on('order.placed', (o) => mailer.sendConfirmation(o));
`,
      choices: [
        {
          text: 'Observer',
          correct: true,
          why: 'El emisor publica y no sabe quién escucha; sumar un tercer consumidor no toca OrderService. Es además la aplicación directa de SRP: analytics y mail dejaron de ser razones de cambio del servicio de pedidos.',
        },
        {
          text: 'Command',
          correct: false,
          why: 'Un Command encapsula la acción como objeto para ejecutarla más tarde, encolarla o deshacerla. Acá los handlers corren en el momento del emit y nadie los guarda.',
        },
        {
          text: 'Strategy',
          correct: false,
          why: 'Strategy elige UNO entre varios algoritmos. Acá corren TODOS los suscriptos, y esa diferencia —uno contra todos— es exactamente la que separa a los dos patrones.',
        },
        {
          text: 'Mediator',
          correct: false,
          why: 'Un Mediator centraliza la comunicación entre varios objetos que si no se hablarían entre sí, en las dos direcciones. Acá hay un emisor y N oyentes que no se conocen ni se coordinan.',
        },
      ],
      takeaway: 'Strategy elige UNO. Observer avisa a TODOS.',
    },
    {
      id: 'd2-q7',
      kind: 'multipleChoice',
      prompt: 'Este código es el motor de esta misma app. ¿Qué patrón es?',
      snippet: `
const table: { [K in ItemKind]: Handler<Extract<Item, { kind: K }>> } = {
  theory: theoryHandler,
  diagram: diagramHandler,
  multipleChoice: multipleChoiceHandler,
  trueFalse: trueFalseHandler,
  code: codeHandler,
  numeric: numericHandler,
};

export function runItem(item: Item, ctx: HandlerCtx): Promise<ItemOutcome> {
  const handler = table[item.kind] as Handler<Item>;
  return handler(item, ctx);
}
`,
      choices: [
        {
          text: 'Strategy, implementado como dispatch table',
          correct: true,
          why: 'Cada handler es un algoritmo intercambiable detrás del mismo contrato ((item, ctx) => Promise<ItemOutcome>) y se elige en runtime por el kind. Es Strategy con un mapa en vez de un switch, y el tipo mapeado agrega algo que ninguna implementación clásica te da gratis: si agregás un kind y te olvidás del handler, no compila.',
        },
        {
          text: 'Factory',
          correct: false,
          why: 'No construye nada: selecciona una función existente y la ejecuta. Una factory devolvería el handler para que otro decida cuándo llamarlo.',
        },
        {
          text: 'Visitor',
          correct: false,
          why: 'Trampa buena, porque Visitor también despacha por tipo. Pero va al revés: el objeto acepta al visitante (item.accept(visitor)) y el visitante tiene un método por tipo. Acá el item es data pura sin métodos y el motor es el que elige — que es justamente lo que permite que el contenido no dependa del motor.',
        },
        {
          text: 'Chain of Responsibility',
          correct: false,
          why: 'Ahí cada handler decide si atiende o pasa al siguiente, en cadena, y el orden importa. Acá el despacho es directo por clave, sin cadena, sin orden y sin fallback.',
        },
      ],
    },
    {
      id: 'd2-c1a',
      kind: 'multipleChoice',
      prompt: '¿Qué patrón es este, y cómo lo reconocés?',
      snippet: `
export function withRetry(repo: UserRepository, opts: RetryOpts): UserRepository {
  return {
    findById: (id) => retry(() => repo.findById(id), opts),
    findByEmail: (e) => retry(() => repo.findByEmail(e), opts),
    save: (u) => repo.save(u),
  };
}

const repo = withCache(withRetry(new PgUserRepository(pool), { attempts: 3 }), {
  ttlMs: 60_000,
});
`,
      choices: [
        {
          text: 'Decorator: recibe X, devuelve X con capacidad extra.',
          correct: true,
          why: 'La firma es la clave: recibe la interfaz X, devuelve la interfaz X. Eso te deja apilarlos en cualquier orden.',
        },
        {
          text: 'Adapter: acopla `UserRepository` a un cliente con distinta firma.',
          correct: false,
          why: 'Adapter cambia la INTERFAZ. Decorator la MANTIENE. Acá `withRetry(repo)` sigue siendo un `UserRepository`, no otra cosa.',
        },
        {
          text: 'Proxy: intercepta cada método con una política de retry.',
          correct: false,
          why: 'Proxy suele preservar la interfaz también, pero apunta a CONTROLAR el acceso (lazy load, seguridad, remoting). Decorator apunta a AGREGAR comportamiento composable. La firma sola no alcanza para distinguirlos; el intento sí.',
        },
        {
          text: 'Strategy: elige la política de retry en runtime.',
          correct: false,
          why: 'Strategy elige UN algoritmo entre varios. Acá se APILAN capas ortogonales (retry + cache), no se eligen entre alternativas.',
        },
      ],
    },
    {
      id: 'd2-c1b',
      kind: 'multipleChoice',
      prompt: '¿Qué te permite este patrón que una jerarquía de clases NO te permitiría?',
      choices: [
        {
          text: 'Combinar N capacidades en runtime sin explotar el árbol de clases.',
          correct: true,
          why: 'El orden queda en una línea que podés cambiar; en herencia queda congelado en la jerarquía. Y en tests armás el repo pelado sin ninguna capa.',
        },
        {
          text: 'Cambiar el orden de las capas sin recompilar el proyecto.',
          correct: false,
          why: 'Suena razonable pero es una consecuencia trivial: la herencia también se reordena recompilando. La ventaja real es no escribir 2^N clases para las combinaciones posibles.',
        },
        {
          text: 'Ejecutar cache y retry en paralelo cuando el método lo permite.',
          correct: false,
          why: 'Las capas se ejecutan en cadena (retry adentro de cache). No hay paralelismo — hay composición.',
        },
        {
          text: 'Cambiar la interfaz pública del repo por capa.',
          correct: false,
          why: 'Al contrario: la ventaja es que NO cambian la interfaz. Si cambiara, dejarían de ser apilables.',
        },
      ],
    },
    {
      id: 'd2-c1c',
      kind: 'multipleChoice',
      prompt: 'En `withRetry`, `save` NO se reintenta. ¿Por qué es una decisión deliberada?',
      snippet: `
save: (u) => repo.save(u),  // sin retry
`,
      choices: [
        {
          text: 'Reintentar una escritura no idempotente puede duplicar datos.',
          correct: true,
          why: 'Si `save` crea un pedido y el retry se dispara por un timeout de red donde la escritura ya se hizo, terminás con dos pedidos. El patrón te da el LUGAR para tomar la decisión; el CRITERIO lo ponés vos.',
        },
        {
          text: 'Reintentar `save` violaría la transacción abierta en el repo.',
          correct: false,
          why: 'Tentador porque suena a transacciones, pero el problema real no es transaccional: es que el retry no distingue "no llegó" de "llegó y se perdió el ACK". Con eso, aun sin transacciones, duplicás.',
        },
        {
          text: 'Con retry en `save`, el orden de los `save` deja de estar garantizado.',
          correct: false,
          why: 'El orden depende del código que llama a `save`, no del retry. Y en cualquier caso, si el orden importa, `save` no debería estar en paralelo — es un problema aparte.',
        },
        {
          text: 'El retry en `save` se agotaría más rápido por el timeout mayor.',
          correct: false,
          why: 'La duración no cambia si se debe reintentar. Reintentaríamos una lectura lenta sin problema.',
        },
      ],
      takeaway: 'Decorator te da el lugar donde tomar decisiones por-método (retry sí en lecturas, no en escrituras no idempotentes). El patrón habilita el criterio; no te ahorra pensarlo.',
    },
  ],
  summary: [
    'Singleton: una instancia por proceso. En JS, un módulo ya lo es. Bien para infraestructura, veneno para estado por request.',
    'Factory: centraliza QUÉ se construye. Strategy: intercambia QUÉ comportamiento se ejecuta. Suelen ir juntos.',
    'Repository: interfaz en lenguaje de DOMINIO + traducción a la fuente. Si no lo podés implementar contra HTTP, es un wrapper del ORM.',
    'Adapter: interfaces distintas, traduce. Decorator: la misma interfaz, agrega. Es la confusión más común de las dos familias.',
    'Strategy elige UNO. Observer avisa a TODOS.',
    'Observer desacopla al emisor de los consumidores, y a cambio esconde el flujo.',
    'Ninguno de estos seis necesita clases en JS: se reconocen por la estructura, no por el nombre del archivo.',
  ],
};
