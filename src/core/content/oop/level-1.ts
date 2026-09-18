import type { Level } from '../../domain/section.js';

export const level1: Level = {
  level: 1,
  title: 'Los 4 pilares',
  goal: 'Al terminar vas a poder mirar una clase y nombrar qué pilar está sosteniendo el diseño — y cuál está roto.',
  items: [
    {
      id: 'a1-t0',
      kind: 'theory',
      title: 'Los 4 pilares no son 4 features del lenguaje',
      body: 'Encapsulamiento, abstracción, herencia y polimorfismo se enseñan como una lista de cosas que sabe hacer un lenguaje, y así no sirven para nada. Son cuatro respuestas a una sola pregunta: cómo hago para que un cambio adentro de un módulo no se propague afuera. Cada pilar ataca un frente distinto de esa pregunta, y tres de los cuatro se pueden aplicar sin escribir una sola clase.',
      analogy:
        'Cuatro herramientas de una caja, no cuatro pasos de una receta. El destornillador no viene "después" de la pinza: usás la que corresponde al problema que tenés adelante.',
    },
    {
      id: 'a1-t1',
      kind: 'theory',
      title: 'Encapsulamiento',
      body: 'Encapsular es agrupar los datos con el código que los modifica y controlar quién puede tocarlos. El objetivo real no es esconder por esconder: es garantizar que el objeto nunca quede en un estado inválido. Si cualquiera puede escribir cuenta.saldo = -500, no existe ningún lugar donde puedas hacer cumplir la regla "el saldo no puede ser negativo".',
      analogy:
        'Un cajero automático: no te dejan meter la mano en el cajón de los billetes. Pedís por una ranura que valida tu identidad, chequea el saldo y recién ahí entrega. La ranura no existe para esconderte la plata — existe para que las reglas se cumplan siempre, sin importar quién esté del otro lado.',
    },
    {
      id: 'a1-q1',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el objetivo principal del encapsulamiento?',
      choices: [
        {
          text: 'Garantizar que el objeto no pueda quedar en un estado inválido, concentrando en un solo lugar las reglas que lo mantienen consistente.',
          correct: true,
          why: 'El encapsulamiento existe para proteger INVARIANTES. Si las reglas viven en un único punto de entrada, es imposible violarlas por olvido desde otro archivo.',
        },
        {
          text: 'Esconder los datos para que nadie de afuera pueda leerlos.',
          correct: false,
          why: 'Confunde encapsulamiento con secreto. Leer casi siempre está bien: un getter de sólo lectura es perfectamente encapsulado. El problema es ESCRIBIR sin pasar por las reglas.',
        },
        {
          text: 'Poner private en todos los campos y exponer un getter y un setter por cada uno.',
          correct: false,
          why: 'Es encapsulamiento de mentira, y es lo que sale por defecto de muchos IDEs. Un setter público por campo equivale al campo público, con más código. El olor: si existe setSaldo(), la regla "no negativo" no vive en ningún lado.',
        },
        {
          text: 'Agrupar métodos relacionados en la misma clase para que el código quede ordenado.',
          correct: false,
          why: 'Eso es COHESIÓN, que también es deseable pero es otra cosa. Podés tener una clase muy cohesiva y con todo su estado público — ordenada y rompible al mismo tiempo.',
        },
      ],
      takeaway: 'Encapsular es proteger invariantes, no ocultar datos.',
      codeExample: `
// SIN encapsulamiento: cualquiera puede romper la invariante.
class Cuenta {
  saldo = 0;
}
const c = new Cuenta();
c.saldo = -500; // nadie te frena.

// CON encapsulamiento: la regla vive en UN solo lugar.
class CuentaOk {
  #saldo = 0;
  depositar(monto) {
    if (monto <= 0) throw new Error('monto inválido');
    this.#saldo += monto;
  }
  get saldo() { return this.#saldo; } // leer está bien; escribir sin control, no.
}
`,
    },
    {
      id: 'a1-c1',
      kind: 'code',
      ask: '¿Qué pilar es el protagonista acá, y qué te permite que un array suelto de items no te permitiría?',
      snippet: `
class ShoppingCart {
  #items = [];

  add(product, qty) {
    if (qty <= 0) throw new Error('cantidad inválida');
    const existing = this.#items.find((i) => i.sku === product.sku);
    if (existing) existing.qty += qty;
    else this.#items.push({ sku: product.sku, price: product.price, qty });
  }

  get total() {
    return this.#items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
}
`,
      answer:
        'Encapsulamiento. #items es privado, así que el único camino para modificar el carrito es add(), y ahí viven las reglas: cantidad positiva y merge de líneas duplicadas. Con un array suelto (cart.items.push(...)) esas reglas quedarían repetidas en cada lugar que agrega un ítem, y basta con que uno se olvide para tener un carrito con qty negativa o dos líneas del mismo sku. Fijate además que total es un getter de sólo lectura: exponer datos no rompe el encapsulamiento; exponer ESCRITURA sin control, sí.',
      why: 'El test mental es siempre el mismo: "¿puedo poner este objeto en un estado inválido desde afuera?". Si la respuesta es sí, no está encapsulado por más private que tenga. Y mirá lo que la clase NO tiene: un setItems(). En el momento en que agregás ese setter, todo el trabajo anterior se cae.',
      choices: [
        {
          text: 'Encapsulamiento: como #items es privado, las reglas (cantidad positiva y merge por sku) viven sólo en add() y no se pueden saltear desde afuera.',
          correct: true,
          why: 'Ese es el punto: si items fuera un array público (cart.items.push(...)), cada archivo que agrega ítems tendría que acordarse de validar. Con #items privado, la única puerta es add(), y las reglas se cumplen sin depender de la memoria de nadie.',
        },
        {
          text: 'Encapsulamiento: #items es privado y por eso nadie de afuera puede LEER el contenido del carrito.',
          correct: false,
          why: 'Confunde encapsulamiento con secreto. Fijate que la clase expone total como getter — leer está bien. Lo que #items evita no es la lectura: es la ESCRITURA sin pasar por add().',
        },
        {
          text: 'Abstracción: la clase esconde que por dentro usa un array y te ofrece un modelo mental de "carrito".',
          correct: false,
          why: 'Abstracción también hay, pero no es el protagonista. Un array público llamado items también sería abstracción ("hay una lista de ítems"). Lo que cambia con #items es que las reglas no pueden violarse — eso es encapsulamiento.',
        },
        {
          text: 'Polimorfismo: add() se comporta distinto si el item ya existe o si es nuevo.',
          correct: false,
          why: 'Eso es un if adentro de un método, no polimorfismo. Polimorfismo sería que distintos tipos de carrito respondan distinto al mismo llamado — acá hay una sola clase con un condicional interno.',
        },
      ],
    },
    {
      id: 'a1-t2',
      kind: 'theory',
      title: 'Abstracción',
      body: 'Abstracción es decidir qué mostrar y qué callar. Un objeto expone un modelo mental —"un repositorio de usuarios"— y esconde si abajo hay Postgres, una API o un archivo. Se confunde con encapsulamiento todo el tiempo, y la diferencia es simple: abstraer es la DECISIÓN de diseño (qué concepto le mostrás al que te usa); encapsular es el MECANISMO (controlar el acceso a lo que no mostraste).',
      analogy:
        'El volante de un auto. Girás a la izquierda y el auto dobla; no sabés si abajo hay dirección hidráulica, eléctrica o mecánica, y no querés saberlo. El volante es la abstracción "dirección". Si el fabricante cambia el mecanismo, tu manera de manejar no cambia.',
    },
    {
      id: 'a1-d1',
      kind: 'diagram',
      title: 'La superficie pública y el interior',
      ascii: `
              el que te usa
                    │
                    │  sólo puede llamar a esto
                    ▼
   ┌───────────────────────────────────┐
   │  add(product, qty)                │   superficie pública
   │  get total()                      │   ABSTRACCIÓN: qué concepto exponés
   ├───────────────────────────────────┤
   │  #items = []                      │   interior
   │  #mergeLines()                    │   ENCAPSULAMIENTO: cómo protegés
   │  #applyDiscounts()                │   lo que no exponés
   └───────────────────────────────────┘

   cambiar el interior     →  nadie se entera
   cambiar la superficie   →  rompés a todos tus usuarios
`,
      caption:
        'Los dos primeros pilares son la misma línea vista desde los dos lados. Arriba decidís qué concepto mostrás; abajo garantizás que nadie pueda romper tus invariantes. La regla práctica: todo lo que quede arriba de la línea es un compromiso que vas a tener que sostener, así que cada método público que agregás es deuda futura.',
    },
    {
      id: 'a1-q2',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la diferencia entre abstracción y encapsulamiento?',
      choices: [
        {
          text: 'La abstracción es QUÉ concepto exponés; el encapsulamiento es CÓMO controlás el acceso a lo que no exponés. Uno es decisión de diseño, el otro es mecanismo.',
          correct: true,
          why: 'Por eso podés tener una clase bien encapsulada (todo private) con una abstracción pésima (un método hacerTodo() que no significa nada).',
        },
        {
          text: 'Son sinónimos: encapsular es abstraer.',
          correct: false,
          why: 'Van juntos casi siempre, y por eso se confunden, pero son independientes. Un módulo puede esconder bien sus datos y aun así exponer un modelo mental incoherente.',
        },
        {
          text: 'La abstracción se logra con clases abstractas e interfaces; el encapsulamiento con private.',
          correct: false,
          why: 'Confunde los conceptos con las palabras clave del lenguaje. Podés abstraer con una función, y encapsular con un closure, sin escribir una sola clase.',
        },
        {
          text: 'La abstracción es para el que escribe la clase; el encapsulamiento para el que la usa.',
          correct: false,
          why: 'Es una distinción inventada. Si acaso, la abstracción es lo que le importa al que USA (es lo único que ve) y el encapsulamiento lo que le importa al que ESCRIBE (es su margen de maniobra).',
        },
      ],
      takeaway: 'Abstracción = qué concepto muestro. Encapsulamiento = cómo protejo lo que no muestro.',
    },
    {
      id: 'a1-tf1',
      kind: 'trueFalse',
      statement: 'Una buena abstracción es la que esconde la mayor cantidad de detalles posible.',
      answer: false,
      why: 'La cantidad no es la métrica. Lo que hay que esconder son los detalles que pueden CAMBIAR, y hay que exponer los que el usuario necesita para hacer su trabajo. Una abstracción que esconde de más se vuelve inútil (hacerTodo()), y una que se filtra —que te obliga a saber qué hay abajo para usarla bien— es una leaky abstraction. El ejemplo canónico: un ORM que te esconde el SQL hasta que una query anda lenta y tenés que entender el SQL igual, pero ahora a través de una capa más.',
    },
    {
      id: 'a1-t3',
      kind: 'theory',
      title: 'Herencia',
      body: 'La herencia dice que una clase ES un tipo de otra, y por eso recibe su estructura y su comportamiento. Es la más fácil de usar y la más fácil de arruinar: te da reuso inmediato a cambio del acoplamiento más fuerte que existe entre dos clases. La subclase queda atada a los detalles internos de la base, así que un cambio en la base puede romper subclases que ni sabías que existían — el problema de la clase base frágil.',
      analogy:
        'Un contrato de alquiler heredado: te viene con todas las cláusulas del anterior, incluidas las que no leíste. Y cuando el dueño cambia una cláusula del contrato madre, te la cambia a vos también, sin que te enteres.',
    },
    {
      id: 'a1-q3',
      kind: 'multipleChoice',
      prompt: '¿Cuándo la herencia es la herramienta correcta?',
      choices: [
        {
          text: 'Cuando en todo lugar donde el código espera la clase base, podés pasarle una subclase y nada se rompe.',
          correct: true,
          why: 'El test es concreto: si tenés una función que recibe Vehiculo y funciona bien con Auto, también tiene que funcionar con Bicicleta sin que nadie tenga que enterarse de la diferencia. Si la subclase te obliga a agregar un if en el código que la usa, no es herencia — es un caso especial disfrazado. (Este test tiene nombre formal: principio de sustitución de Liskov.)',
        },
        {
          text: 'Cuando dos clases comparten código y no querés repetirlo.',
          correct: false,
          why: 'Es la razón número uno por la que se abusa de la herencia. Compartir código es una motivación de reuso, no una relación de tipos: para eso está la composición, o directamente una función suelta.',
        },
        {
          text: 'Cuando la subclase agrega campos y métodos a la base.',
          correct: false,
          why: 'Describe lo que la herencia PERMITE, no cuándo conviene. Agregar es fácil; los problemas empiezan cuando la subclase necesita RESTRINGIR algo que la base prometía.',
        },
        {
          text: 'Cuando querés que las dos clases compartan la misma interfaz.',
          correct: false,
          why: 'Para eso alcanza una interfaz. La herencia es interfaz + implementación + estado: si sólo necesitás el contrato, estás pagando tres cosas y usando una.',
        },
      ],
    },
    {
      id: 'a1-c2a',
      kind: 'multipleChoice',
      prompt: '¿Qué pilar se está usando para relacionar `UserService` con `ApiClient`?',
      snippet: `
class ApiClient {
  constructor(protected baseUrl: string) {}
  async get(path: string) { /* fetch + retry + logging */ }
  async post(path: string, body: unknown) { /* ... */ }
}

class UserService extends ApiClient {
  async findById(id: string) {
    return this.get('/users/' + id);
  }
}
`,
      choices: [
        {
          text: 'Herencia, vía `extends`.',
          correct: true,
          why: '`extends` es literalmente la palabra clave de herencia en TS/JS. UserService recibe get, post y baseUrl como propios, incluyendo lo que no le sirve.',
        },
        {
          text: 'Composición: `UserService` usa un `ApiClient` como colaborador.',
          correct: false,
          why: 'Composición sería `class UserService { constructor(private api: ApiClient) {} }`, con el ApiClient como campo. Acá no hay campo: `UserService` ES un `ApiClient`, no lo tiene.',
        },
        {
          text: 'Polimorfismo: `UserService` es sustituible por `ApiClient`.',
          correct: false,
          why: 'Eso es una CONSECUENCIA de la herencia, no el mecanismo que se está usando para construir la relación. La pregunta apunta a la herramienta, no al efecto.',
        },
        {
          text: 'Encapsulación: `protected baseUrl` esconde detalles a la subclase.',
          correct: false,
          why: 'El modificador es un detalle secundario. Lo que estructura la relación entre las dos clases es `extends`, no el nivel de acceso de un campo.',
        },
      ],
      takeaway: 'Cuando veas `extends`, pensá "herencia" — sin importar si abajo el código parece de composición.',
    },
    {
      id: 'a1-c2b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el problema principal de resolverlo así, con `extends`?',
      snippet: `
class ApiClient {
  constructor(protected baseUrl: string) {}
  async get(path: string) { /* fetch + retry + logging */ }
  async post(path: string, body: unknown) { /* ... */ }
}

class UserService extends ApiClient {
  async findById(id: string) {
    return this.get('/users/' + id);
  }
}
`,
      choices: [
        {
          text: '`UserService` expone `post()` y `get()` sin que nadie lo haya decidido.',
          correct: true,
          why: 'Es el síntoma más confiable de herencia forzada: la subclase hereda superficie pública que no querías. `userService.post("/lo/que/sea", {})` es una llamada válida que jamás debería estar disponible.',
        },
        {
          text: '`ApiClient` no está marcado como `abstract`, permitiendo instancias sueltas.',
          correct: false,
          why: 'Abstracta o no, el problema es de RELACIÓN, no de forma. UserService no ES un ApiClient — lo USA. Marcar la base como abstract no cambia eso.',
        },
        {
          text: '`findById` rompe LSP: no existe en `ApiClient`.',
          correct: false,
          why: '`findById` es específico de usuarios y agregar métodos NUEVOS en la subclase no rompe LSP — lo que rompe LSP es cambiar el contrato de los heredados. La pista falsa está en confundir "extender" con "violar".',
        },
        {
          text: '`baseUrl` está `protected` y queda expuesto a toda la jerarquía.',
          correct: false,
          why: 'Detalle menor. El problema real es la superficie pública heredada (`post`, `get`), no un campo interno.',
        },
      ],
      takeaway: 'Herencia por reuso ≠ herencia por sustituibilidad. Si heredás métodos que después tenés que "esconder", es la señal.',
    },
    {
      id: 'a1-c2c',
      kind: 'multipleChoice',
      prompt: '¿Cómo lo re-escribirías?',
      snippet: `
class ApiClient {
  constructor(protected baseUrl: string) {}
  async get(path: string) { /* fetch + retry + logging */ }
  async post(path: string, body: unknown) { /* ... */ }
}

class UserService extends ApiClient {
  async findById(id: string) {
    return this.get('/users/' + id);
  }
}
`,
      choices: [
        {
          text: 'Composición: `constructor(private api: ApiClient)` y delegar en `this.api.get(...)`.',
          correct: true,
          why: 'La superficie pública de `UserService` pasa a ser exactamente lo que `UserService` decidió ofrecer. `post` deja de estar disponible desde afuera, y en tests inyectás un `ApiClient` falso sin mockear métodos de tu propia clase.',
        },
        {
          text: 'Sobreescribir `post` en `UserService` con un `throw` para bloquearla.',
          correct: false,
          why: 'Es el olor infalible de herencia forzada: subclase que rompe un método base. Mueve el error a runtime y sigue mintiendo en el tipo, que dice que `post` existe.',
        },
        {
          text: 'Marcar `post` como `private` en `ApiClient` para que no llegue a la subclase.',
          correct: false,
          why: 'Rompe a los que sí necesitan `post` (por ejemplo, un `OrderService`). Y sigue sin resolver el problema conceptual: `UserService` sigue "siendo" un `ApiClient` cuando no lo es.',
        },
        {
          text: 'Convertir `ApiClient` en genérico `ApiClient<T>` con `findById` incluido.',
          correct: false,
          why: 'Empuja la lógica de dominio hacia una capa de infraestructura. `ApiClient` deja de ser genérico y termina sabiendo de usuarios, órdenes, productos... El acoplamiento se invierte pero no se elimina.',
        },
      ],
      codeExample: `// Con composición, la superficie pública queda bajo control:
class UserService {
  constructor(private api: ApiClient) {}

  async findById(id: string) {
    return this.api.get('/users/' + id);
  }
}

// afuera:
userService.findById('42')       // ok, decidido
userService.post('/whatever', {}) // error de compilación: no existe`,
      takeaway: 'Cuando pensás "necesito reusar X", componé. Cuando pensás "esto ES un tipo de X", heredá.',
    },
    {
      id: 'a1-t4',
      kind: 'theory',
      title: 'Polimorfismo',
      body: 'Polimorfismo es que el mismo llamado haga cosas distintas según el objeto que lo recibe. En la práctica es lo que te deja escribir un for que procesa cosas heterogéneas sin un solo if sobre el tipo. Es el pilar que más rinde en código real: cada if (tipo === ...) que eliminás es un lugar menos donde tenés que acordarte de agregar el caso nuevo dentro de seis meses.',
      analogy:
        'Un enchufe. Le conectás una lámpara, un cargador o una aspiradora: el enchufe hace siempre lo mismo (dar 220V) y cada aparato responde distinto. La pared no tiene un if (esLampara).',
    },
    {
      id: 'a1-q4',
      kind: 'multipleChoice',
      prompt: 'En TypeScript, ¿qué necesitás para tener polimorfismo?',
      choices: [
        {
          text: 'Que los objetos compartan una forma compatible. No hace falta herencia: TS tipa por estructura, así que cualquier objeto con los métodos correctos sirve.',
          correct: true,
          why: 'Tipado estructural: si camina como pato, es pato. Un objeto literal { charge: async () => ... } satisface la interfaz sin heredar de nada ni declarar implements.',
        },
        {
          text: 'Una clase base abstracta de la que todos hereden.',
          correct: false,
          why: 'Es UNA forma de conseguirlo (polimorfismo de subtipo por herencia), no la única ni la más liviana. En TS una interfaz —o directamente la forma del objeto— alcanza y no arrastra implementación ni estado.',
        },
        {
          text: 'Sobrecarga de métodos: varias funciones con el mismo nombre y distintos parámetros.',
          correct: false,
          why: 'Eso es overloading, que TS soporta sólo a nivel de tipos (una implementación, varias firmas). Es otro concepto: resuelve en compile-time por argumentos, no en runtime por el objeto receptor.',
        },
        {
          text: 'Genéricos.',
          correct: false,
          why: 'Los genéricos son polimorfismo PARAMÉTRICO: Array<T> se comporta igual sin importar T. Lo del enchufe es polimorfismo de SUBTIPO: comportamiento distinto ante el mismo llamado. Los dos son útiles y resuelven cosas diferentes.',
        },
      ],
      takeaway: 'En TS el tipado es estructural: el contrato lo define la forma, no el nombre.',
    },
    {
      id: 'a1-q6',
      kind: 'multipleChoice',
      prompt: '¿Qué pilar está en juego en este diseño?',
      snippet: `
interface PaymentMethod {
  charge(amountCents: number): Promise<{ ok: boolean; ref: string }>;
}

class CardPayment implements PaymentMethod { /* ... */ }
class TransferPayment implements PaymentMethod { /* ... */ }

async function checkout(order: Order, method: PaymentMethod) {
  const result = await method.charge(order.totalCents);
  if (!result.ok) throw new PaymentFailed(order.id);
  return result.ref;
}
`,
      choices: [
        {
          text: 'Polimorfismo: distintos objetos (CardPayment, TransferPayment) responden al mismo llamado (charge) sin que checkout sepa cuál está usando.',
          correct: true,
          why: 'Ese es el patrón. checkout depende del contrato PaymentMethod, no de una implementación concreta. La decisión "cómo cobrar" queda en cada clase; checkout sólo orquesta.',
        },
        {
          text: 'Herencia: CardPayment y TransferPayment heredan de PaymentMethod.',
          correct: false,
          why: 'PaymentMethod es una INTERFAZ, no una clase base. Las implementaciones no heredan estado ni comportamiento — sólo se comprometen a cumplir el contrato. Herencia sería class CardPayment extends BasePayment.',
        },
        {
          text: 'Encapsulamiento: cada clase de pago esconde su detalle interno.',
          correct: false,
          why: 'También hay encapsulamiento, pero no es lo protagonista acá. Lo que hace posible que checkout funcione sin saber el tipo concreto es el polimorfismo — el mismo llamado, distintos comportamientos.',
        },
        {
          text: 'Abstracción: PaymentMethod define un concepto sin detalles de implementación.',
          correct: false,
          why: 'La abstracción está y ayuda, pero es la mitad del cuento: sin polimorfismo, checkout tendría que preguntar de qué tipo es el método antes de llamarlo. El pilar que hace el trabajo pesado acá es polimorfismo.',
        },
      ],
    },
    {
      id: 'a1-q7',
      kind: 'multipleChoice',
      prompt: '¿Qué gana concretamente la función checkout con este diseño?',
      snippet: `
async function checkout(order: Order, method: PaymentMethod) {
  const result = await method.charge(order.totalCents);
  if (!result.ok) throw new PaymentFailed(order.id);
  return result.ref;
}
`,
      choices: [
        {
          text: 'No tiene ni un solo if sobre el tipo de método de pago: le habla al contrato charge, no a las implementaciones.',
          correct: true,
          why: 'Ese es el valor concreto. Cada if (method === "card") que evitás es un lugar menos donde tenés que acordarte de agregar el caso nuevo cuando aparece un método más.',
        },
        {
          text: 'Que checkout es más rápido de ejecutar porque no tiene que decidir qué método usar.',
          correct: false,
          why: 'La ganancia no es de performance — la decisión de qué método usar sigue existiendo, sólo que ocurre AFUERA de checkout. Adentro no cambia el costo de ejecución.',
        },
        {
          text: 'Que checkout puede reintentar el cobro automáticamente si falla.',
          correct: false,
          why: 'Nada en este código habla de reintentos. Si falla, se lanza PaymentFailed y listo. Reintentos serían una responsabilidad que hoy no está.',
        },
        {
          text: 'Que checkout puede procesar varios pagos en paralelo.',
          correct: false,
          why: 'Podría, pero no viene de este diseño: paralelismo es otro tema. Lo que este diseño gana es cerrado a extensión sin modificación — agregar un método de pago no obliga a tocar checkout.',
        },
      ],
    },
    {
      id: 'a1-q8',
      kind: 'multipleChoice',
      prompt: '¿Qué pasa el día que agregan pago con cripto?',
      snippet: `
interface PaymentMethod {
  charge(amountCents: number): Promise<{ ok: boolean; ref: string }>;
}

class CardPayment implements PaymentMethod { /* ... */ }
class TransferPayment implements PaymentMethod { /* ... */ }

// checkout no aparece en este ejercicio a propósito.
`,
      choices: [
        {
          text: 'Se agrega class CryptoPayment implements PaymentMethod y checkout no se toca — es el único archivo que NO aparece en ese pull request.',
          correct: true,
          why: 'Ese es el pago concreto que te dio invertir en el diseño. Un archivo nuevo, ninguna modificación en el código existente. En OOP se conoce como principio Open/Closed (abierto a extensión, cerrado a modificación).',
        },
        {
          text: 'Hay que modificar la interfaz PaymentMethod para agregar el caso cripto.',
          correct: false,
          why: 'Al revés: la interfaz sigue igual. El contrato "cobrame estos centavos" no cambia por ser cripto — sólo cambia CÓMO se cumple, y eso vive en la nueva clase.',
        },
        {
          text: 'Hay que modificar checkout para agregar un if que maneje el caso cripto.',
          correct: false,
          why: 'Ese if es justo lo que este diseño elimina. Si tuvieras que agregarlo, sería señal de que el contrato PaymentMethod no cubre lo que cripto necesita — y la respuesta ahí es rediseñar el contrato, no meter el if.',
        },
        {
          text: 'Hay que hacer que CryptoPayment herede de CardPayment.',
          correct: false,
          why: 'Sería forzado y no aporta nada: cripto y tarjeta no comparten implementación real. Ambos SÓLO comparten el contrato PaymentMethod, y para eso la interfaz alcanza y sobra.',
        },
      ],
      takeaway: 'Cada if sobre el tipo que eliminás con polimorfismo es un lugar menos donde acordarse del caso nuevo.',
    },
    {
      id: 'a1-tf2',
      kind: 'trueFalse',
      statement: 'Sin herencia no puede haber polimorfismo.',
      answer: false,
      why: 'La herencia es una forma de conseguir polimorfismo, no la única. En TypeScript el tipado es estructural: un objeto literal satisface una interfaz sin heredar ni declarar implements. En JS puro alcanza con que el método exista (duck typing). Y además existen el polimorfismo paramétrico (genéricos) y el ad-hoc (uniones discriminadas con un switch exhaustivo, que es lo que usa el motor de esta misma app para los tipos de ítem). Confundir polimorfismo con herencia es lo que lleva a construir jerarquías de clases donde alcanzaba una interfaz.',
    },
    {
      id: 'a1-q5',
      kind: 'multipleChoice',
      prompt:
        'Estás diseñando un módulo de notificaciones con tres canales (email, SMS, push). ¿Qué diseño elegís?',
      choices: [
        {
          text: 'Una interfaz Notifier con una implementación por canal, y el código que notifica recibe un Notifier sin saber cuál es.',
          correct: true,
          why: 'Abstracción (el concepto "notificador") + polimorfismo (cada canal responde distinto al mismo llamado). Agregar WhatsApp mañana es un archivo nuevo y una línea en el composition root.',
        },
        {
          text: 'Una clase base Notifier con la lógica común y tres subclases que la extienden.',
          correct: false,
          why: 'Es lo primero que sale y funciona hasta que un canal necesita algo que la base no previó (push requiere un token de device, SMS tiene límite de caracteres). La lógica común, si existe de verdad, se comparte mejor por composición: una clase Template o RetryPolicy que los tres USAN.',
        },
        {
          text: 'Una clase NotificationService con un método send(canal, mensaje) y un switch sobre el canal.',
          correct: false,
          why: 'Concentra todo en un lugar y parece lo más simple, pero cada canal nuevo toca ese switch — y en la práctica toca otros tres switch que aparecieron por el camino (formateo, reintentos, métricas). Es justo lo que el polimorfismo elimina.',
        },
        {
          text: 'Tres funciones sueltas —sendEmail, sendSms, sendPush— y que cada caller elija la que necesita.',
          correct: false,
          why: 'Mueve la decisión a cada caller. Ahora la regla "mandá SMS sólo si falló el push" queda repetida en N lugares, y el día que cambia hay que encontrarlos a todos.',
        },
      ],
    },
  ],
  summary: [
    'Encapsulamiento: protegés INVARIANTES, no datos. El test: "¿puedo dejar este objeto inválido desde afuera?".',
    'Abstracción: qué concepto exponés. Encapsulamiento: cómo protegés lo que no exponés. Decisión vs mecanismo.',
    'Una buena abstracción esconde lo que puede CAMBIAR, no la mayor cantidad de cosas posible.',
    'Herencia: el acoplamiento más fuerte que existe. El único test válido es la sustituibilidad, no "comparten código".',
    'Olor de herencia forzada: la subclase hereda métodos públicos que no querías que existieran.',
    'Polimorfismo: cada if sobre el tipo que eliminás es un lugar menos donde acordarse del caso nuevo.',
    'En TypeScript el tipado es estructural: no hace falta herencia (ni implements) para tener polimorfismo.',
  ],
};
