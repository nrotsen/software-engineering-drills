import type { Level } from '../../domain/section.js';

/**
 * CONTENIDO PURO. Fijate que este archivo no importa nada del motor: solo
 * tipos. No sabe que existe inquirer, ni chalk, ni el sistema de puntaje.
 * Para agregar una pregunta, agregas un objeto a `items`. Nada mas.
 */
export const level1: Level = {
  level: 1,
  title: 'Secuencial vs paralelo',
  goal: 'Al terminar vas a poder mirar cualquier función async y decir, sin ejecutarla, si está dejando tiempo sobre la mesa.',
  items: [
    {
      id: 'c1-t1',
      kind: 'theory',
      title: 'Secuencial vs paralelo',
      body: 'Código secuencial hace una cosa, espera a que termine, y recién ahí empieza la siguiente. Paralelo arranca varias y espera a todas juntas. La diferencia sólo importa cuando esperás: I/O (red, disco, base de datos), porque durante esa espera tu proceso no está haciendo nada. Y la decisión de cuál usar sale de una sola pregunta: ¿la entrada de B depende de la salida de A?',
      analogy:
        'Cocinar: ponés el agua a hervir y mientras tanto cortás las verduras, porque cortar no depende del agua. Pero los fideos sí los tirás después de que hierva: eso sí depende. Nadie corta las verduras mirando la olla.',
    },
    {
      id: 'c1-d1',
      kind: 'diagram',
      title: 'Las dos formas, dibujadas en el tiempo',
      ascii: `
SECUENCIAL      total = 100 + 200 + 150 = 450ms

  A ████████
  B         ████████████████
  C                         ████████████
  └──────────────────────────────────────┘ 450ms


PARALELO        total = max(100, 200, 150) = 200ms

  A ████████
  B ████████████████            ← la rama más lenta manda
  C ████████████
  └──────────────┘ 200ms
`,
      caption:
        'Secuencial SUMA. Paralelo toma el MÁXIMO. De ahí sale un corolario que se usa todo el tiempo al optimizar: en un fan-out, acelerar cualquier rama que no sea la más lenta no mejora absolutamente nada.',
    },
    {
      id: 'c1-q1',
      kind: 'multipleChoice',
      prompt:
        'Vas a escribir dos llamadas a APIs distintas. ¿Cuál es la pregunta que decide si podés correrlas en paralelo?',
      choices: [
        {
          text: '¿La entrada de la segunda depende de la salida de la primera?',
          correct: true,
          why: 'Es la única pregunta que importa. Si B necesita un dato que produce A, hay dependencia real y el orden es obligatorio. Si no, esperar a A antes de arrancar B es tiempo regalado por un orden accidental: el orden en que escribiste las líneas.',
        },
        {
          text: '¿Cuál de las dos es más lenta?',
          correct: false,
          why: 'Sirve DESPUÉS de decidir paralelizar (la rama más lenta define la latencia total), pero no te dice si podés. Dos llamadas de 10ms con dependencia siguen siendo obligatoriamente secuenciales.',
        },
        {
          text: '¿Las dos pegan contra el mismo servidor?',
          correct: false,
          why: 'Importa para no saturar un downstream —es el tema del nivel 3— pero es una restricción operativa, no una dependencia de datos. Podés paralelizar igual, con un límite de concurrencia.',
        },
        {
          text: '¿El servidor soporta HTTP/2?',
          correct: false,
          why: 'Detalle de transporte. Cambia cómo se multiplexan las conexiones, no si tu lógica permite arrancar B sin conocer el resultado de A.',
        },
      ],
      takeaway: 'Dependencia de DATOS, no el orden en que lo escribiste.',
    },
    {
      id: 'c1-c1a',
      kind: 'multipleChoice',
      prompt: '¿Cuánto tarda esta función tal como está escrita?',
      snippet: `
async function getDashboard(userId) {
  const profile = await fetchProfile(userId);        // 200ms
  const orders  = await fetchOrders(userId);         // 300ms
  const notifs  = await fetchNotifications(userId);  // 150ms
  return { profile, orders, notifs };
}
`,
      choices: [
        {
          text: '~650ms, secuencial.',
          correct: true,
          why: '200 + 300 + 150 = 650. Es secuencial pese a ser async: `await` significa "no sigas hasta que termine".',
        },
        {
          text: '~300ms: la función `async` ya deja las tres promesas en vuelo.',
          correct: false,
          why: '`async` sólo marca la función como async, no paraleliza nada. Lo que paraleliza es no bloquear entre invocaciones (Promise.all o dispararlas antes de esperar).',
        },
        {
          text: '~450ms: Node solapa el I/O de la segunda con el de la tercera.',
          correct: false,
          why: 'Node no reordena awaits. Corren en el orden en que están escritos, una atrás de la otra.',
        },
        {
          text: 'Depende de la carga del event loop en ese momento.',
          correct: false,
          why: 'Son 100% I/O (fetches). La CPU no interviene: cambiar de máquina no baja los 650ms.',
        },
      ],
    },
    {
      id: 'c1-c1b',
      kind: 'multipleChoice',
      prompt: 'Sobre ese mismo código, ¿por qué es un bug de performance?',
      snippet: `
async function getDashboard(userId) {
  const profile = await fetchProfile(userId);        // 200ms
  const orders  = await fetchOrders(userId);         // 300ms
  const notifs  = await fetchNotifications(userId);  // 150ms
  return { profile, orders, notifs };
}
`,
      choices: [
        {
          text: 'Es un waterfall: awaits en cascada sin dependencia entre líneas.',
          correct: true,
          why: 'Ese es el olor concreto: varios `await` seguidos donde ninguna línea consume la variable de la anterior. Nombre del antipatrón: waterfall (cascada).',
        },
        {
          text: 'La composición de tres awaits crea backpressure en el event loop.',
          correct: false,
          why: 'No hay backpressure con tres awaits — el event loop atiende otras cosas mientras esperás. Suena técnico pero es humo.',
        },
        {
          text: 'Los `await` sin `.then()` no permiten a Node encolar las tres a la vez.',
          correct: false,
          why: '`.then()` con la misma estructura (cada uno adentro del anterior) tendría el mismo problema. La sintaxis no es la causa; la secuenciación sí.',
        },
        {
          text: 'Los tres fetches comparten `userId` y disparan una caché fallida.',
          correct: false,
          why: 'El compartir input no genera caché ni afecta el tiempo. Es una trampa que confunde datos con timing.',
        },
      ],
      takeaway: 'Waterfall: varios `await` seguidos donde ninguno usa el valor del anterior. El bug de performance más común y más invisible en code review.',
    },
    {
      id: 'c1-c1c',
      kind: 'multipleChoice',
      prompt: '¿Cómo lo arreglás?',
      snippet: `
async function getDashboard(userId) {
  const profile = await fetchProfile(userId);        // 200ms
  const orders  = await fetchOrders(userId);         // 300ms
  const notifs  = await fetchNotifications(userId);  // 150ms
  return { profile, orders, notifs };
}
`,
      choices: [
        {
          text: 'Fan-out con `Promise.all([...])` sobre las tres.',
          correct: true,
          why: 'Fan-out: las tres arrancan juntas, esperás a que termine la última. Latencia = max(200, 300, 150) = 300ms.',
        },
        {
          text: 'Sacar los `await` para que arranquen en paralelo, y hacer un solo `await` al final.',
          correct: false,
          why: 'Sin `await`, los valores son promesas — usarlos como si fueran valores rompe el código. `Promise.all` sí resuelve esto con un array explícito.',
        },
        {
          text: 'Reordenarlas por latencia esperada, del más rápido al más lento.',
          correct: false,
          why: 'Suma igual: 150 + 200 + 300 = 650. No importa el orden si son secuenciales.',
        },
        {
          text: 'Cambiar `async/await` por `.then()` encadenados con retorno del valor.',
          correct: false,
          why: 'Misma latencia con distinta sintaxis. No es una cuestión de forma, es de estructura.',
        },
      ],
      codeExample: `async function getDashboard(userId) {
  const [profile, orders, notifs] = await Promise.all([
    fetchProfile(userId),
    fetchOrders(userId),
    fetchNotifications(userId),
  ]);
  return { profile, orders, notifs };
}
// 650ms → 300ms sin cambiar nada del negocio`,
    },
    {
      id: 'c1-tf1',
      kind: 'trueFalse',
      statement:
        'En Node.js, Promise.all hace que tu código corra en varios núcleos de CPU al mismo tiempo.',
      answer: false,
      why: 'Node ejecuta tu JavaScript en un solo hilo. Promise.all no paraleliza CPU: deja varias operaciones de I/O en vuelo a la vez mientras el event loop atiende lo que va llegando. Eso es CONCURRENCIA (varias cosas en progreso), no PARALELISMO (varias ejecutándose en el mismo instante). Para paralelismo real de CPU en Node necesitás worker_threads o varios procesos.',
    },
    {
      id: 'c1-t2',
      kind: 'theory',
      title: 'Concurrencia ≠ paralelismo (y por qué importa justo en Node)',
      body: 'Concurrencia es tener varias tareas en progreso; paralelismo es tenerlas ejecutándose en el mismo instante. Node te regala concurrencia barata para I/O: mientras una request viaja por la red, el event loop atiende otra cosa. Pero tu JavaScript corre en un hilo, así que un cálculo pesado bloquea todo. La regla práctica: async/await acelera la espera, no el cálculo.',
      analogy:
        'Un mozo con diez mesas: toma pedidos de todas y va llevando platos a medida que la cocina los saca. Es uno solo (un hilo), pero nunca está parado esperando que la mesa 3 termine de comer. Ahora, si además tuviera que cocinar cada plato, las diez mesas esperan.',
    },
    {
      id: 'c1-q2',
      kind: 'multipleChoice',
      prompt: '¿Cuál de estos pares NO se puede paralelizar?',
      choices: [
        {
          text: 'Pedir un token de auth, y con ese token pedir el perfil del usuario.',
          correct: true,
          why: 'Dependencia de datos real: el segundo request necesita el token como input. No hay manera de arrancarlo antes. Es secuencial por naturaleza, no por descuido.',
        },
        {
          text: 'Pedir el perfil del usuario y pedir sus últimos pedidos, ambos por userId.',
          correct: false,
          why: 'Las dos sólo necesitan userId, que ya tenés en la mano. Independientes: caso de libro para fan-out.',
        },
        {
          text: 'Escribir un log de auditoría y devolver la respuesta al cliente.',
          correct: false,
          why: 'No sólo son independientes: el log ni siquiera necesita bloquear la respuesta. Podés no esperarlo — con la precaución de manejarle el error, o te queda un unhandledRejection.',
        },
        {
          text: 'Consultar dos microservicios distintos con el mismo ID de pedido.',
          correct: false,
          why: 'Mismo input, resultados independientes entre sí. Fan-out puro.',
        },
      ],
    },
    {
      id: 'c1-n1',
      kind: 'numeric',
      prompt:
        'Tres llamadas independientes de 120ms, 300ms y 80ms. Si las corrés en paralelo, ¿cuál es la latencia total aproximada?',
      answer: 300,
      unit: 'ms',
      why: 'En paralelo la latencia es el MÁXIMO de las ramas, no la suma: arrancan juntas y terminás cuando termina la última. Los 120 y los 80 quedan escondidos detrás de los 300. Corolario para cuando optimices: bajar la de 120ms a 10ms no mejora nada; sólo mover la de 300 cambia el número.',
    },
    {
      id: 'c1-n2',
      kind: 'numeric',
      prompt: 'Las mismas tres llamadas (120, 300, 80), pero escritas como tres await seguidos. ¿Latencia total?',
      answer: 500,
      unit: 'ms',
      why: 'Secuencial suma: 120+300+80 = 500ms. Contra los 300ms del paralelo, son 200ms regalados —el 40% de la respuesta— sin ninguna razón de negocio detrás. Ese delta es exactamente lo que buscás cuando perfilás un endpoint lento.',
    },
    {
      id: 'c1-c2a',
      kind: 'multipleChoice',
      prompt: '¿Cuánto tarda este loop, y por qué?',
      snippet: `
const ids = ['a', 'b', 'c', 'd', 'e'];   // 5 ids
const results = [];

for (const id of ids) {
  results.push(await fetchItem(id));     // 100ms cada una
}
`,
      choices: [
        {
          text: '~500ms: cada iteración espera a la anterior.',
          correct: true,
          why: '5 × 100ms = 500ms. `for...of` no paraleliza; el `await` frena la siguiente iteración exactamente como si escribieras 5 awaits a mano.',
        },
        {
          text: '~100ms: `for...of` sobre un array dispara las iteraciones en paralelo.',
          correct: false,
          why: '`for...of` es sincrónico, y `await` dentro lo espera. Para arrancarlas juntas necesitás `Promise.all(ids.map(fetchItem))`.',
        },
        {
          text: '~500ms sólo si el array supera 4 elementos; con menos, V8 lo optimiza.',
          correct: false,
          why: 'V8 no aplica ninguna optimización de ese tipo. El tiempo es lineal en el largo del array.',
        },
        {
          text: '~250ms: el event loop solapa los `await` alternando iteraciones.',
          correct: false,
          why: 'El event loop atiende otras cosas mientras esperás, pero DENTRO de la misma cadena de `await` no adelanta iteraciones futuras.',
        },
      ],
    },
    {
      id: 'c1-c2b',
      kind: 'multipleChoice',
      prompt: 'Entonces, ¿cuándo un `for` secuencial como este es la forma CORRECTA?',
      snippet: `
for (const id of ids) {
  results.push(await fetchItem(id));
}
`,
      choices: [
        {
          text: 'Cuando hay dependencia entre iteraciones, control de carga u orden de efectos.',
          correct: true,
          why: 'Tres motivos legítimos: dependencia real (paginación por cursor), control de carga sobre el downstream, o efectos ordenados (escrituras). El bug no es el `for` — es usarlo sin ninguna de esas tres razones.',
        },
        {
          text: 'Cuando el array es pequeño y `Promise.all` no da ganancia medible.',
          correct: false,
          why: 'El tamaño no cambia si está bien o mal. Cambia la MAGNITUD del desperdicio, no si hay desperdicio.',
        },
        {
          text: 'Nunca: el patrón moderno es siempre `Promise.all(map(...))`.',
          correct: false,
          why: 'Es antipatrón SÓLO cuando las iteraciones son independientes. Con dependencia entre iteraciones (paginación por cursor) es la forma correcta.',
        },
        {
          text: 'Cuando `fetchItem` es idempotente y se puede reintentar.',
          correct: false,
          why: 'La idempotencia importa para retries, no para elegir secuencial vs paralelo. Podés paralelizar operaciones idempotentes o no idempotentes igual.',
        },
      ],
    },
    {
      id: 'c1-c2c',
      kind: 'multipleChoice',
      prompt: 'Si en vez de 5 fueran 10.000 ids independientes, ¿qué hacés?',
      snippet: `
const ids = [/* 10.000 ids */];
// A) for + await
// B) await Promise.all(ids.map(fetchItem))
// C) otra cosa
`,
      choices: [
        {
          text: 'Ni A ni B: pool con límite de concurrencia (ej. 20 en vuelo).',
          correct: true,
          why: 'El `for` deja 999.900ms sobre la mesa. `Promise.all` dispara 10.000 requests simultáneos y tirás abajo el downstream. La respuesta correcta es acotar cuántas hay en vuelo (nivel 3).',
        },
        {
          text: 'B: el agente HTTP de Node ya encola cuando pasa `maxSockets`.',
          correct: false,
          why: 'Sí encola, y eso vuelve el problema INVISIBLE: los timeouts vencen esperando en tu propia cola local. Encolar no es estar bien.',
        },
        {
          text: 'A con `Promise.all` cada 100 iteraciones para partir el trabajo.',
          correct: false,
          why: 'Es chunking, y ES una solución válida — pero el enunciado dice "for + await" (A) o "Promise.all pelado" (B). Esta variante es "otra cosa", y sin límite explícito puede seguir disparando picos.',
        },
        {
          text: 'Delegar el lote a un `worker_thread` para liberar el event loop.',
          correct: false,
          why: 'El cuello de botella no es CPU, es red. Workers no ayudan con I/O; sólo replican el mismo problema en otro hilo.',
        },
      ],
      takeaway: 'Escala pequeña: `for` vs `Promise.all` según dependencia. Escala grande: siempre con límite de concurrencia.',
      codeExample: `// límite de concurrencia manual (idea básica, no producción)
async function map(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}`,
    },
    {
      id: 'c1-tf2',
      kind: 'trueFalse',
      statement:
        'Promise.all es lo que dispara las operaciones: hasta que no lo llamás, las promesas del array no arrancaron.',
      answer: false,
      why: 'Una promesa arranca cuando la CREÁS, no cuando la esperás. fetchA() ya salió a la red en el momento en que se ejecutó esa línea; Promise.all sólo espera. Por eso esto ya es paralelo: const a = fetchA(); const b = fetchB(); const ra = await a; const rb = await b. Y por eso const a = await fetchA() es secuencial: el await frena la línea siguiente. Las promesas en JS son eager, al revés de un Observable de RxJS que no hace nada hasta que te suscribís.',
    },
    {
      id: 'c1-q3',
      kind: 'multipleChoice',
      prompt:
        'Tenés un endpoint que hace un cálculo pesado en JS (parsear y agregar un CSV grande: 800ms de CPU pura). Lo envolvés en async y lo metés en un Promise.all junto a otras dos tareas de red. ¿Qué pasa?',
      choices: [
        {
          text: 'No mejora nada: el cálculo bloquea el event loop 800ms y las otras dos ni siquiera avanzan mientras tanto.',
          correct: true,
          why: 'async/await no crea hilos. Un bloque de CPU sin puntos de await monopoliza el único hilo de JS, así que las otras promesas no pueden progresar aunque sean I/O. Peor todavía: frenás el servidor entero, no sólo este request.',
        },
        {
          text: 'Mejora: las tres tareas se reparten entre los núcleos disponibles.',
          correct: false,
          why: 'Eso requiere paralelismo real y Promise.all no lo da: no aparece ningún hilo nuevo. Confundir esto es el malentendido número uno sobre async en Node.',
        },
        {
          text: 'Mejora sólo si las otras dos tareas también son de CPU.',
          correct: false,
          why: 'Justo al revés: si las tres son de CPU, las tres compiten por el mismo hilo y el total vuelve a ser la suma.',
        },
        {
          text: 'No cambia nada porque V8 ya optimiza automáticamente ese tipo de cálculo.',
          correct: false,
          why: 'V8 optimiza cómo se ejecuta el código, no lo muda a otro hilo. El bloqueo del event loop es idéntico.',
        },
      ],
      takeaway:
        'async/await acelera la ESPERA (I/O). Para CPU: worker_threads, otro proceso, o sacar el trabajo del request y mandarlo a una cola.',
    },
    {
      id: 'c1-d2',
      kind: 'diagram',
      title: 'El árbol de decisión completo del nivel 1',
      ascii: `
            ¿La entrada de B depende de la salida de A?
                             │
              ┌──────────────┴──────────────┐
             SÍ                             NO
              │                              │
       ┌──────────────┐              ¿Es I/O o es CPU?
       │  SECUENCIAL  │                      │
       │ await A;     │          ┌───────────┴───────────┐
       │ await B;     │         I/O                     CPU
       └──────────────┘          │                       │
                          ┌─────────────┐        ┌────────────────┐
                          │ Promise.all │        │ worker_threads │
                          │  (fan-out)  │        │ proceso aparte │
                          └─────────────┘        │ cola de trabajo│
                                                 └────────────────┘
`,
      caption:
        'Casi todas las decisiones de concurrencia en un backend Node salen de estas dos preguntas, en este orden. Si en una entrevista te preguntan "¿cómo optimizarías este endpoint?", este árbol es la respuesta estructurada.',
    },
  ],
  summary: [
    'Secuencial SUMA latencias; paralelo toma el MÁXIMO de las ramas.',
    'La única pregunta que decide si podés paralelizar: ¿la entrada de B depende de la salida de A?',
    'Varios await seguidos donde ninguno usa la variable del anterior = waterfall. El bug de performance más común y más invisible en code review.',
    'Concurrencia (varias cosas en progreso) ≠ paralelismo (varias a la vez). Node te da la primera, barata, para I/O.',
    'Las promesas son eager: arrancan al crearlas. Promise.all espera, no dispara.',
    'async/await no acelera CPU. Para eso: worker_threads, otro proceso, o sacarlo del request.',
  ],
};
