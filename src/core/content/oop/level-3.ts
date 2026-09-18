import type { Level } from '../../domain/section.js';

export const level3: Level = {
  level: 3,
  title: 'SOLID y cómo justificarlo',
  goal: 'Al terminar vas a poder nombrar qué costo evita cada principio, aplicarlo sobre código real, y decir cuándo NO vale la pena — que es lo que separa a un senior en una entrevista.',
  items: [
    {
      id: 'a3-t0',
      kind: 'theory',
      title: 'Cinco reglas, un solo objetivo',
      body: 'Los cinco principios apuntan a lo mismo: que un cambio previsible toque poco código y no rompa nada. Ninguno es una regla binaria que se cumpla o se viole; son direcciones, y todas se pagan con indirección. En una entrevista, la respuesta que separa a un senior no es recitar las siglas: es decir qué costo evita cada principio y cuándo no vale la pena pagarlo.',
      analogy:
        'Cinco reglas de una cocina profesional: cada estación hace una cosa, se agregan herramientas sin mover las mesas, cualquier cocinero puede cubrir una estación, nadie carga con utensilios que no usa, y todos trabajan contra la comanda y no contra el mozo que la trajo. Nada de eso hace la comida más rica. Hacen que el servicio no se caiga cuando algo cambia.',
    },
    {
      id: 'a3-t1',
      kind: 'theory',
      title: 'S — Single Responsibility',
      body: 'No es "una clase hace una sola cosa": es "una clase tiene una sola razón para cambiar". La diferencia importa porque "una cosa" no tiene definición operativa y "razón de cambio" sí. Un InvoiceService que calcula impuestos, arma el PDF y manda el mail tiene tres razones —el fisco, diseño, el proveedor de mail— y tres equipos distintos van a pisarse en el mismo archivo. La formulación original de Robert Martin es todavía más concreta: un módulo debería responderle a un solo actor.',
      analogy:
        'Un formulario que firman tres áreas distintas. Cada vez que una cambia su parte hay que reimprimir todo y volver a juntar las otras dos firmas. Separarlo en tres formularios no es prolijidad: es que cada área pueda avanzar sin coordinar con las otras.',
    },
    {
      id: 'a3-q1',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la formulación correcta del Single Responsibility Principle?',
      choices: [
        {
          text: 'Un módulo debería tener una sola razón para cambiar, es decir, responderle a un solo actor o stakeholder.',
          correct: true,
          why: 'Es operativa: te da un criterio para decidir. Mirás quién pide los cambios y ahí está la línea de corte.',
        },
        {
          text: 'Una clase debería hacer una sola cosa.',
          correct: false,
          why: 'Es la versión de póster, y es inaplicable porque "una cosa" no tiene definición. ¿guardarUsuario es una cosa, o son validar + serializar + escribir? Sin el criterio de razón de cambio no podés decidir nada, y por eso mucha gente termina partiendo clases al azar.',
        },
        {
          text: 'Una clase debería tener un solo método público.',
          correct: false,
          why: 'Llevaría a miles de clases de un método, que es tan malo como el God Object: la lógica que cambia junta queda desparramada en veinte archivos, y ahora un cambio simple toca veinte lugares.',
        },
        {
          text: 'Una función no debería superar las 20 líneas.',
          correct: false,
          why: 'Es una heurística de legibilidad, no SRP. Podés tener una función de cinco líneas que le responde a tres actores distintos, y una de cincuenta que le responde a uno solo.',
        },
      ],
      takeaway: 'La pregunta operativa: "¿quién me va a pedir que cambie esto?". Si son dos áreas, son dos módulos.',
    },
    {
      id: 'a3-c1a',
      kind: 'multipleChoice',
      prompt: '¿Cuántas RAZONES DE CAMBIO distintas tiene `OrderService.place()`?',
      snippet: `
class OrderService {
  async place(input: OrderInput) {
    if (!input.items.length) throw new Error('carrito vacío');
    if (input.total !== input.items.reduce((s, i) => s + i.price * i.qty, 0))
      throw new Error('total inconsistente');

    const order = await this.db.orders.insert({ ...input, status: 'placed' });

    await this.sendgrid.send({
      to: input.email,
      subject: 'Pedido ' + order.id + ' confirmado',
      html: '<h1>¡Gracias!</h1><p>Total: $' + (input.total / 100).toFixed(2) + '</p>',
    });

    await this.segment.track('order_placed', { orderId: order.id, revenue: input.total });
    return order;
  }
}
`,
      choices: [
        {
          text: 'Cuatro: negocio, persistencia, marketing y analytics.',
          correct: true,
          why: 'Cuatro actores distintos, cuatro equipos que van a pedirte cambios en este archivo. Sus PRs chocan en el mismo método.',
        },
        {
          text: 'Una: "colocar un pedido" es un caso de uso único.',
          correct: false,
          why: 'Es la respuesta que suena bien y viola SRP en la práctica: marketing va a pedir cambios en el mail sin tener que ver con el negocio del pedido.',
        },
        {
          text: 'Tres: validación, persistencia y side effects (mail + tracking).',
          correct: false,
          why: 'Agrupa mail y tracking bajo "side effects", pero marketing y analytics son actores DISTINTOS con ciclos de cambio propios. Fusionarlos vuelve a violar SRP.',
        },
        {
          text: 'Depende: si un equipo dueño toca todo, cuenta como una sola.',
          correct: false,
          why: 'No: depende de cuántos ACTORES distintos piden cambios. Aunque el equipo dueño sea uno, marketing pide subject y analytics pide eventos — son roles distintos aunque compartan tech lead.',
        },
      ],
    },
    {
      id: 'a3-c1b',
      kind: 'multipleChoice',
      prompt: '¿Qué SÍ separarías de `place()` en colaboradores propios?',
      choices: [
        {
          text: 'El mail y el tracking, cada uno a su propio colaborador.',
          correct: true,
          why: 'Los dos tienen actores propios que no deberían tocar el core del pedido. Cada uno cambia por su cuenta sin coordinación.',
        },
        {
          text: 'Cada validación a su propia clase (`CartNotEmpty`, `TotalMatches`).',
          correct: false,
          why: 'Ambas validaciones responden AL MISMO actor (las reglas del pedido). Partirlas en dos clases agrega indirección sin desacoplar a nadie.',
        },
        {
          text: 'La persistencia (`db.orders.insert`) a un `OrderRepository`.',
          correct: false,
          why: 'Válido y útil, pero es un cambio de INFRAESTRUCTURA (inversión de dependencia), no de responsabilidad. La pregunta apunta a los actores de negocio.',
        },
        {
          text: 'Nada por ahora: refactorizar sin regresiones documentadas es prematuro.',
          correct: false,
          why: 'La motivación no es estética: es que cada cambio de mail o analytics va a pisarse con el negocio. Ya hay evidencia (cuatro actores) para actuar.',
        },
      ],
    },
    {
      id: 'a3-c1c',
      kind: 'multipleChoice',
      prompt: '¿Qué NO separarías, y por qué?',
      choices: [
        {
          text: 'Las dos validaciones: comparten actor (reglas del pedido).',
          correct: true,
          why: 'SRP se paga con indirección. Separar por SUSTANTIVOS en vez de por ACTORES es el error más común al aplicarlo.',
        },
        {
          text: 'La inserción en la base, para no romper la atomicidad de la transacción.',
          correct: false,
          why: 'La persistencia SÍ tiene actor propio (DBA, cambios de esquema), pero se aísla vía repositorio inyectado — no se "deja adentro". Y la atomicidad se maneja con transacciones, no dejando el `insert` in-line.',
        },
        {
          text: 'El envío del mail, porque forma parte del contrato del pedido.',
          correct: false,
          why: 'Al revés: es lo que MÁS conviene separar. Marketing va a pedirte cambios de asunto y HTML sin tocar el negocio.',
        },
        {
          text: 'El tracking, porque cross-cutting concerns van in-line al proceso principal.',
          correct: false,
          why: 'Eso justifica más aún separarlo (como evento de dominio + listener). Que sea cross-cutting no significa que deba estar inline: significa que se implementa con un mecanismo horizontal.',
        },
      ],
      takeaway: 'SRP se aplica por ACTORES, no por sustantivos. Prueba práctica: mirá los commits de un archivo grande — si vienen de motivos que no tienen nada que ver entre sí, ahí está la línea de corte.',
    },
    {
      id: 'a3-t2',
      kind: 'theory',
      title: 'O — Open/Closed',
      body: 'Abierto a extensión, cerrado a modificación. En criollo: que agregar un caso nuevo signifique agregar código, no editar un switch que ya funciona y está probado. No se logra prediciendo el futuro —eso es adivinar— sino identificando el eje por el que ya sabés que el sistema crece: métodos de pago, canales de notificación, formatos de export, proveedores de envío.',
      analogy:
        'Una zapatilla con enchufes libres: conectás un aparato nuevo sin abrir la pared. Ahora, si el aparato nuevo necesita 380V, hay que abrir la pared igual. La extensibilidad siempre es por un eje concreto, nunca "en general".',
    },
    {
      id: 'a3-q2',
      kind: 'multipleChoice',
      prompt: '¿Cuál de estas afirmaciones sobre Open/Closed es correcta?',
      choices: [
        {
          text: 'Se aplica sobre el eje por el que ya sabés que el sistema crece; intentar dejarlo abierto a todo es sobreingeniería.',
          correct: true,
          why: 'La extensibilidad tiene una dirección. Abrir el eje equivocado te deja con puntos de extensión que nadie usa y que igual hay que mantener y testear.',
        },
        {
          text: 'Nunca hay que modificar código que ya está en producción.',
          correct: false,
          why: 'Literalmente imposible: los bugs se arreglan modificando. El principio habla de agregar CASOS a una familia conocida, no de congelar el repositorio.',
        },
        {
          text: 'Se logra haciendo que todas las clases sean extensibles y que nada quede cerrado.',
          correct: false,
          why: 'Maximizar puntos de extensión te deja un diseño lleno de ganchos vacíos. Cada gancho es superficie pública: hay que documentarla, testearla y sostenerla aunque nadie la use.',
        },
        {
          text: 'Es el principio de responsabilidad única aplicado a la herencia.',
          correct: false,
          why: 'Son distintos y ortogonales: SRP habla de razones de cambio (cómo partís), OCP de cómo agregás casos sin editar lo existente (cómo extendés).',
        },
      ],
      takeaway:
        'La pregunta: "¿qué tipo de cosa nueva me van a pedir agregar tres veces por año?". Ese eje se abre; el resto se deja cerrado.',
    },
    {
      id: 'a3-t3',
      kind: 'theory',
      title: 'L — Liskov Substitution',
      body: 'Si S es subtipo de T, tenés que poder usar un S en cualquier lugar donde se espera un T y que el programa siga siendo correcto. Es el principio que le da sentido a la herencia y el que más silenciosamente se viola: el compilador te deja, y el error aparece en runtime, en producción, en el caso raro. Tres síntomas para reconocerlo: la subclase tira donde la base no tiraba, exige más de lo que la base exigía, o devuelve menos de lo que la base prometía.',
      analogy:
        'Un contrato de alquiler que subalquilás. Si el subinquilino dice "yo no acepto mascotas", el contrato original dejó de valer para todos los que lo firmaron. La sustitución tiene que ser invisible para el que sólo conoce el contrato madre.',
    },
    {
      id: 'a3-c2a',
      kind: 'multipleChoice',
      prompt: '`LocalStore` compila pero viola Liskov. ¿Cuál es la violación por "EXIGIR MÁS" que el contrato?',
      snippet: `
interface FileStore {
  /** Guarda el archivo y devuelve su URL pública. */
  save(key: string, data: Buffer): Promise<string>;
}

class LocalStore implements FileStore {
  async save(key: string, data: Buffer) {
    if (data.byteLength > 5_000_000) throw new Error('archivo muy grande');
    await writeFile('/tmp/' + key, data);
    return 'file:///tmp/' + key;
  }
}
`,
      choices: [
        {
          text: 'Rechaza archivos > 5MB: una precondición que el contrato no exigía.',
          correct: true,
          why: 'La subclase impone una restricción que el contrato no tenía. Código que anda contra S3 explota contra Local con archivos grandes.',
        },
        {
          text: 'El límite de 5MB tendría que estar tipado en el parámetro `data`.',
          correct: false,
          why: 'TS no tiene tipos por tamaño de buffer, así que no es un problema de firma. Y aunque lo tuviera, la violación seguiría siendo que la subclase exige más que el contrato — sólo se pagaría más temprano.',
        },
        {
          text: 'Escribe en `/tmp`, que puede no existir en algunos entornos.',
          correct: false,
          why: 'El destino de escritura es un detalle de implementación permitido. Que `/tmp` no exista es un problema operativo, no una violación de LSP.',
        },
        {
          text: '`writeFile` puede rechazar la promesa, cosa que `s3.put` no hace.',
          correct: false,
          why: 'Ambas pueden rechazar (red caída, disco lleno, permisos). La probabilidad relativa no cambia el contrato: `Promise<string>` deja abierto el rechazo.',
        },
      ],
    },
    {
      id: 'a3-c2b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la SEGUNDA violación de LSP en `LocalStore`, por "DEVOLVER MENOS" de lo prometido?',
      snippet: `
async save(key: string, data: Buffer) {
  await writeFile('/tmp/' + key, data);
  return 'file:///tmp/' + key;
}
`,
      choices: [
        {
          text: 'Devuelve `file://...` cuando el contrato promete "URL pública".',
          correct: true,
          why: 'Los tipos garantizan la FORMA (es un `string`), no el SIGNIFICADO (que sea alcanzable desde internet). Esa brecha entre tipo y contrato es donde viven los bugs de sustitución.',
        },
        {
          text: 'El esquema `file://` no está en la lista de URIs válidas de fetch.',
          correct: false,
          why: 'Es un síntoma de la violación real (no es pública), pero la razón no es el esquema — es que no cumple lo que prometía el contrato. Una URL `http://localhost` tendría el mismo problema.',
        },
        {
          text: 'La ruta expone `/tmp`, que puede leerse desde otros procesos del host.',
          correct: false,
          why: 'Es un problema de seguridad distinto. LSP habla del CONTRATO devuelto (URL pública), no de la superficie del filesystem local.',
        },
        {
          text: 'La URL se genera concatenando strings, no con `URL.pathToFileURL`.',
          correct: false,
          why: 'La forma de armar la URL es un detalle. Aunque estuviera perfectamente construida, seguiría no siendo "pública" — que es lo que exige el contrato.',
        },
      ],
      takeaway: 'LSP falla donde el tipo no llega. Por eso valen tanto los tests de contrato: una misma suite contra todas las implementaciones detecta lo que el compilador no ve.',
    },
    {
      id: 'a3-t4',
      kind: 'theory',
      title: 'I — Interface Segregation',
      body: 'Nadie debería depender de métodos que no usa. Una interfaz gorda obliga a sus implementaciones a soportar cosas que no soportan (y a tirar excepciones), y obliga a sus consumidores a saber más de lo necesario. La versión práctica, y la más útil en TypeScript: las interfaces las define el que CONSUME, no el que implementa, y se dimensionan según lo que ese consumidor necesita.',
      analogy:
        'Un control remoto universal con ochenta botones. Para prender la tele usás dos. Los otros setenta y ocho no son gratis: te confunden a vos, y obligan al fabricante del próximo aparato a decidir qué hace con cada uno.',
    },
    {
      id: 'a3-q3',
      kind: 'multipleChoice',
      prompt:
        'Tenés interface UserRepository con 12 métodos. El módulo de login sólo usa findByEmail. ¿Cuál es la mejor lectura?',
      choices: [
        {
          text: 'El módulo de login debería declarar su propia interfaz chica (interface UserFinder { findByEmail }) y recibir eso. La implementación grande la satisface igual.',
          correct: true,
          why: 'Y en TS es gratis por el tipado estructural: no hay que tocar ni la implementación ni la interfaz grande. El login pasa a depender exactamente de lo que usa, y su test necesita un doble de un solo método.',
        },
        {
          text: 'Está bien así: son sólo tipos, se borran al compilar y no cuestan nada en runtime.',
          correct: false,
          why: 'El costo no es de runtime, es de acoplamiento. Para testear el login tenés que construir un doble con 12 métodos, y cualquier cambio en la interfaz grande te toca aunque no uses ninguno de esos métodos.',
        },
        {
          text: 'Hay que partir UserRepository en 12 interfaces de un método cada una.',
          correct: false,
          why: 'Sobrecorrección: te quedan doce nombres que nadie recuerda ni encuentra. El tamaño lo define el CONSUMIDOR, y un consumidor real suele usar dos o tres métodos que van juntos.',
        },
        {
          text: 'Habría que usar una clase abstracta con implementaciones por defecto para los métodos que el login no usa.',
          correct: false,
          why: 'No resuelve el acoplamiento y suma el de la herencia. Además, implementaciones por defecto que no hacen nada son una violación de Liskov esperando a ocurrir.',
        },
      ],
      takeaway: 'En TS la interfaz la escribe el consumidor. El tipado estructural hace que no haya que tocar la implementación.',
    },
    {
      id: 'a3-t5',
      kind: 'theory',
      title: 'D — Dependency Inversion',
      body: 'Los módulos de alto nivel no deben depender de los de bajo nivel: los dos dependen de abstracciones. La palabra que importa es INVERSIÓN: la interfaz la define y la posee el módulo de arriba (el dominio), no el de abajo (la infraestructura). Por eso InvoiceRepository vive junto a las facturas y no junto a Postgres, y es la clase de Postgres la que se adapta a él.',
      analogy:
        'El enchufe otra vez, pero mirá quién define la norma: la casa. El fabricante del electrodoméstico se adapta a la norma de la casa, no al revés. Si fuera al revés, cada aparato nuevo obligaría a picar la pared.',
    },
    {
      id: 'a3-d1',
      kind: 'diagram',
      title: 'Qué se invierte, exactamente',
      ascii: `
SIN INVERSIÓN                        CON INVERSIÓN

 ┌───────────────────┐               ┌──────────────────────────┐
 │      domain/      │               │         domain/          │
 │  InvoiceService   │               │  InvoiceService          │
 └─────────┬─────────┘               │  interface InvoiceRepo   │◀──┐
           │ import                  └──────────────────────────┘   │
           ▼                                                        │ import
 ┌───────────────────┐               ┌──────────────────────────┐   │
 │      infra/       │               │         infra/           │───┘
 │  PostgresRepo     │               │  PostgresInvoiceRepo     │
 └───────────────────┘               │    implements InvoiceRepo│
                                     └──────────────────────────┘
  la flecha apunta                    la flecha apunta
  al DETALLE                          a lo ESTABLE
`,
      caption:
        'La inversión es literal: se da vuelta la flecha del import. La interfaz vive del lado del dominio —el que la usa es el que la define— y la infraestructura se adapta. Test de code review que no requiere entender el código: si un archivo de dominio importa algo de infraestructura, la flecha está al revés. Es tan mecánico que se puede automatizar, y es exactamente lo que hace tests/architecture.test.ts en este proyecto.',
    },
    {
      id: 'a3-c3a',
      kind: 'multipleChoice',
      prompt: 'Mirá SÓLO la línea del `import`. ¿Qué te dice sobre la arquitectura?',
      snippet: `
// src/domain/invoice-service.ts
import { PostgresInvoiceRepository } from '../infra/postgres-invoice-repository.js';

export class InvoiceService {
  private repo = new PostgresInvoiceRepository();
  async issue(orderId: string) { /* ... */ }
}
`,
      choices: [
        {
          text: '`domain/` importa desde `infra/`: la flecha apunta al detalle.',
          correct: true,
          why: 'Regla mecánica de revisión: si un archivo de `domain/` importa algo de `infra/`, la flecha está mal. No hace falta leer el cuerpo.',
        },
        {
          text: 'Está bien: `import type` sólo trae el tipo, no la implementación.',
          correct: false,
          why: 'No es un `import type` — es un import de valor (usa `new PostgresInvoiceRepository()`). Y aunque fuera `type`, el acoplamiento de diseño quedaría igual: domain sigue nombrando a infra.',
        },
        {
          text: 'La ruta relativa `../infra/...` acopla el dominio a la estructura de carpetas.',
          correct: false,
          why: 'La ruta relativa es un síntoma, no el problema. Aunque usaras un alias `@infra/...`, seguiría siendo `domain` dependiendo de `infra`.',
        },
        {
          text: 'Falta un `.js` al final del import en modo ESM estricto.',
          correct: false,
          why: 'El `.js` ya está en el ejemplo. Y aunque faltara, sería un problema de resolución de módulos, no de arquitectura.',
        },
      ],
    },
    {
      id: 'a3-c3b',
      kind: 'multipleChoice',
      prompt: '¿Cómo se INVIERTE la dependencia?',
      choices: [
        {
          text: 'La `interface` vive en `domain/`; `infra/` la implementa e importa del dominio.',
          correct: true,
          why: 'Se da vuelta literalmente la flecha del `import`: infra depende de domain. El composition root arma las piezas concretas.',
        },
        {
          text: 'Inyectar `PostgresInvoiceRepository` por constructor en vez de hacer `new` interno.',
          correct: false,
          why: 'Eso es INYECCIÓN sin INVERSIÓN. El dominio sigue importando de infra, y sigue atado a Postgres.',
        },
        {
          text: 'Extraer una `abstract class InvoiceRepository` en `domain/` y extenderla en `infra/`.',
          correct: false,
          why: 'Mueve el contrato al dominio (bien) pero con `abstract class` en vez de `interface` — arrastra herencia y estado compartido. La forma limpia es una interfaz que `infra/` implementa por composición.',
        },
        {
          text: 'Mover `PostgresInvoiceRepository` a `domain/` para que todo importe local.',
          correct: false,
          why: 'Mueve el problema, no lo resuelve: ahora tenés infra viviendo con dominio. La inversión es sobre quién POSEE el contrato, no sobre carpetas.',
        },
      ],
      takeaway: 'Inversión ≠ Inyección. Inyectar una clase CONCRETA es inyección sin inversión. La inversión ocurre cuando lo inyectado es una ABSTRACCIÓN definida por el módulo de arriba.',
    },
    {
      id: 'a3-q4',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la diferencia entre inversión de dependencias (DIP) e inyección de dependencias?',
      choices: [
        {
          text: 'La inyección es el mecanismo (pasar la dependencia desde afuera); la inversión es que lo inyectado sea una abstracción definida por el módulo de alto nivel.',
          correct: true,
          why: 'Podés tener inyección sin inversión, y es lo más habitual: constructor(private repo: PostgresRepo) inyecta, pero el dominio sigue dependiendo de Postgres.',
        },
        {
          text: 'Son lo mismo con dos nombres distintos.',
          correct: false,
          why: 'Es la confusión más común y la que más se nota en una entrevista. Una es una técnica de cableado, la otra es una decisión sobre quién posee el contrato.',
        },
        {
          text: 'La inversión requiere un contenedor de DI como InversifyJS o tsyringe.',
          correct: false,
          why: 'Un contenedor automatiza el cableado cuando el grafo se vuelve grande. La inversión es de diseño y funciona perfecto con un new escrito a mano en el composition root: este proyecto no usa ningún contenedor.',
        },
        {
          text: 'La inyección sirve para los tests; la inversión, para producción.',
          correct: false,
          why: 'Las dos son decisiones de diseño. Que los tests se vuelvan fáciles es una CONSECUENCIA agradable, no el objetivo — y si el único argumento que tenés es "para poder mockear", te van a repreguntar por qué no usás jest.mock y te vas a quedar sin respuesta.',
        },
      ],
    },
    {
      id: 'a3-tf1',
      kind: 'trueFalse',
      statement: 'Aplicar los cinco principios SOLID siempre mejora el diseño.',
      answer: false,
      why: 'Cada principio se paga con indirección: más archivos, más interfaces, más saltos para seguir una llamada. En un CRUD chico, en un módulo estable o en un script, esa indirección es costo puro. La pregunta correcta no es "¿esto cumple SOLID?" sino "¿qué cambio espero, y cuánto me cuesta prepararme hoy?". El caso claro: un PdfExporter único que nadie va a extender no necesita una interfaz Exporter — la agregás el día que aparece el segundo formato, y ese refactor son diez minutos con el compilador de tu lado. Aplicar los principios preventivamente sobre ejes que nunca se mueven es la forma más común de sobreingeniería en código que se presenta como "limpio".',
    },
    {
      id: 'a3-q5',
      kind: 'multipleChoice',
      prompt:
        'En una entrevista te preguntan "¿por qué pondrías una interfaz acá?". ¿Cuál respuesta te posiciona mejor?',
      choices: [
        {
          text: '"Porque espero una segunda implementación por una razón concreta, y además me deja testear sin infraestructura. Si supiera que va a haber una sola para siempre, no la pondría."',
          correct: true,
          why: 'Nombra el beneficio, el eje de cambio y el LÍMITE. Lo último es lo que suena a alguien que ya pagó el costo de sobreingeniería alguna vez y aprendió dónde está la línea.',
        },
        {
          text: '"Porque es una buena práctica y sigue el principio de inversión de dependencias."',
          correct: false,
          why: 'Recita el nombre sin el porqué. Es la respuesta de alguien que leyó SOLID pero no lo aplicó bajo presión, y la repregunta obvia —"¿y cuándo NO lo harías?"— la deja sin piso.',
        },
        {
          text: '"Porque el código queda más limpio y desacoplado."',
          correct: false,
          why: '"Limpio" y "desacoplado" no significan nada sin decir de QUÉ te desacoplás y para qué. Es la respuesta más fácil de repreguntar y la que más entrevistas hunde.',
        },
        {
          text: '"Porque si no, no puedo mockear en los tests."',
          correct: false,
          why: 'Es cierto pero incompleto, y suena defensivo: sugiere que la única razón es la herramienta de testing. Invita a la repregunta "¿y si mockeás el módulo entero?", y ahí el argumento se cae.',
        },
      ],
      takeaway: 'Nombrá el beneficio, el eje de cambio, y cuándo NO lo harías. El límite es lo que muestra criterio.',
    },
  ],
  summary: [
    'SRP: una sola RAZÓN DE CAMBIO, no "una sola cosa". El criterio operativo es el actor que pide el cambio.',
    'OCP: se abre el eje por el que ya sabés que el sistema crece. Abrir todo es sobreingeniería.',
    'LSP: el subtipo no puede tirar más, exigir más ni devolver menos que el contrato. Aplica a interfaces, no sólo a herencia.',
    'ISP: la interfaz la escribe el consumidor. En TS es gratis por el tipado estructural.',
    'DIP: se invierte la flecha del IMPORT. La interfaz la posee el dominio, no la infraestructura.',
    'Inyección ≠ inversión: inyectar una clase concreta es inyección sin inversión.',
    'Ningún principio es gratis: todos se pagan con indirección. Sobre un eje que no se mueve, es costo puro.',
    'En una entrevista: beneficio + eje de cambio + cuándo NO lo harías.',
  ],
};
