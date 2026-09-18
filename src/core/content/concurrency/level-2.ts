import type { Level } from '../../domain/section.js';

export const level2: Level = {
  level: 2,
  title: 'Fan-out con Promise.all y cálculo de latencia',
  goal: 'Al terminar vas a poder mirar el diagrama de un endpoint y estimar su latencia de cabeza, y defender ese número en una discusión de performance.',
  items: [
    {
      id: 'c2-t1',
      kind: 'theory',
      title: 'El patrón fan-out',
      body: 'Fan-out es disparar N tareas independientes a la vez y esperarlas juntas; en JS es literalmente await Promise.all(tareas). La latencia deja de ser la suma y pasa a ser la rama más lenta, más lo que hagas antes y después. Es el patrón que convierte un endpoint de agregación lento en uno rápido sin tocar ni una línea de los servicios que consultás.',
      analogy:
        'Mandás a tres personas a hacer tres mandados distintos al mismo tiempo, en vez de ir vos a los tres. Terminás cuando vuelve el más lento — no cuando se acumulan los tres viajes.',
    },
    {
      id: 'c2-d1',
      kind: 'diagram',
      title: 'Fan-out y fan-in',
      ascii: `
                  ┌──────────────┐
                  │   handler    │
                  └──────┬───────┘
                         │   fan-out  (Promise.all)
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │  perfil  │ │ pedidos  │ │  notifs  │
      │  200ms   │ │  300ms   │ │  150ms   │
      └────┬─────┘ └────┬─────┘ └────┬─────┘
           └────────────┼────────────┘
                        │   fan-in  (esperar a todas)
                        ▼
                  ┌──────────────┐
                  │  respuesta   │   total ≈ 300ms
                  └──────────────┘
`,
      caption:
        'Fan-out (abro a N) + fan-in (espero a todas). El costo en tiempo es max(ramas), no la suma. Pero fijate en algo que el dibujo también muestra: el ANCHO del fan-out es la carga simultánea que le estás poniendo a los downstream. Eso es lo que hay que limitar cuando N crece (nivel 3).',
    },
    {
      id: 'c2-n1',
      kind: 'numeric',
      prompt:
        'Un handler hace: validar el token (50ms); después, en paralelo, pedir perfil (200ms), pedidos (300ms) y notificaciones (150ms); y al final armar la respuesta (20ms). ¿Latencia total?',
      answer: 370,
      unit: 'ms',
      why: '50 + max(200, 300, 150) + 20 = 50 + 300 + 20 = 370ms. El método es siempre el mismo: recorrés el grafo por etapas, sumás lo secuencial y tomás el máximo dentro de cada etapa paralela. Si esto fuera todo secuencial, serían 720ms.',
    },
    {
      id: 'c2-n2',
      kind: 'numeric',
      prompt: 'El mismo handler pero todo secuencial (50 → 200 → 300 → 150 → 20). ¿Total?',
      answer: 720,
      unit: 'ms',
      why: '720ms contra 370ms: casi la mitad, y sin tocar una línea de los servicios downstream. Este es el argumento que llevás a una discusión de performance — "el fan-out nos saca 350ms del p50 sin depender de otros equipos" — y es mucho más fuerte que "queda más prolijo".',
    },
    {
      id: 'c2-q1',
      kind: 'multipleChoice',
      prompt: '¿Qué devuelve Promise.all([a, b, c]) cuando las tres resuelven?',
      choices: [
        {
          text: 'Un array con los resultados en el MISMO orden del array de entrada, sin importar cuál resolvió primero.',
          correct: true,
          why: 'El orden es posicional y está garantizado por la spec. Por eso el destructuring const [perfil, pedidos] = await Promise.all([...]) es seguro y se lee bien.',
        },
        {
          text: 'Un array con los resultados en el orden en que fueron resolviendo.',
          correct: false,
          why: 'Es la intuición natural ("llegó primero, va primero") y es falsa. Si fuera así, el destructuring por posición sería una lotería y nadie podría usarlo.',
        },
        {
          text: 'Un objeto con las promesas como claves.',
          correct: false,
          why: 'No existe. Lo más parecido lo armás vos con Object.fromEntries sobre pares [clave, valor] — útil de verdad cuando tenés muchos campos y el destructuring posicional se vuelve frágil de mantener.',
        },
        {
          text: 'Un array de objetos { status, value }.',
          correct: false,
          why: 'Ese es el formato de Promise.allSettled, no el de Promise.all. La diferencia entre los dos es el tema central del nivel 3.',
        },
      ],
    },
    {
      id: 'c2-tf1',
      kind: 'trueFalse',
      statement:
        'Si una de las promesas de un Promise.all rechaza, las demás se cancelan y dejan de ejecutarse.',
      answer: false,
      why: 'Promise.all rechaza apenas rechaza la primera —eso sí, es fail-fast— pero las otras siguen corriendo hasta el final: en JS no existe cancelar una promesa. Dos consecuencias prácticas: (1) los efectos secundarios de las otras igual ocurren, esa escritura se va a hacer; (2) si otra rechaza después, ya nadie la está esperando, y te queda un unhandledRejection. Para cancelar de verdad necesitás un AbortController pasado a cada operación.',
    },
    {
      id: 'c2-c1a',
      kind: 'multipleChoice',
      prompt: '¿Por qué el segundo `Promise.all` NO se puede fusionar con el primero?',
      snippet: `
async function getDashboard(userId) {
  const [profile, orders] = await Promise.all([
    fetchProfile(userId),
    fetchOrders(userId),
  ]);

  const shipments = await Promise.all(
    orders.map((o) => fetchShipment(o.shipmentId)),
  );

  return { profile, orders, shipments };
}
`,
      choices: [
        {
          text: 'La etapa 2 depende del resultado de la etapa 1 (`o.shipmentId`).',
          correct: true,
          why: 'La misma pregunta del nivel 1, aplicada etapa por etapa: ¿la entrada de B depende de la salida de A? Sí → obligatoriamente secuencial entre etapas.',
        },
        {
          text: 'Anidar `Promise.all` bloquea el event loop en el `await` externo.',
          correct: false,
          why: 'No bloquea nada del event loop. Anidar `Promise.all` es perfectamente válido; el limitante es la dependencia de datos, no el anidamiento.',
        },
        {
          text: '`orders.map` con async devuelve funciones, no promesas listas para `Promise.all`.',
          correct: false,
          why: '`orders.map(o => fetchShipment(o.shipmentId))` devuelve un array de PROMESAS (fetchShipment se invoca en el mapping), y `Promise.all` sobre eso funciona.',
        },
        {
          text: 'Los tipos de `profile`, `orders` y `shipments` no son homogéneos.',
          correct: false,
          why: '`Promise.all` acepta arrays de tipos heterogéneos y devuelve una tupla tipada. La heterogeneidad no impide fusionar; la dependencia de datos sí.',
        },
      ],
    },
    {
      id: 'c2-c1b',
      kind: 'multipleChoice',
      prompt: 'Si perfil=200ms, pedidos=300ms, cada envío=100ms y hay 4 pedidos: ¿cuánto tarda el endpoint?',
      snippet: `
async function getDashboard(userId) {
  const [profile, orders] = await Promise.all([
    fetchProfile(userId),   // 200ms
    fetchOrders(userId),    // 300ms
  ]);

  const shipments = await Promise.all(
    orders.map((o) => fetchShipment(o.shipmentId)), // 100ms × 4
  );

  return { profile, orders, shipments };
}
`,
      choices: [
        {
          text: '~400ms.',
          correct: true,
          why: 'Etapa 1: perfil y pedidos independientes → max(200, 300) = 300ms. Etapa 2: los 4 envíos en paralelo entre sí → 100ms. Suma entre etapas: 400ms.',
        },
        {
          text: '~700ms: máximo de la etapa 1 más los 4 envíos secuenciales.',
          correct: false,
          why: 'Los 4 envíos van en paralelo (mismo `Promise.all`), no secuencial. Suma entre etapas, MÁXIMO dentro de cada etapa.',
        },
        {
          text: '~900ms: la suma de todas las latencias.',
          correct: false,
          why: 'Ese sería el peor caso, todo secuencial. Perfil y pedidos son independientes, y los envíos entre sí también.',
        },
        {
          text: '~300ms: los envíos alcanzan a entrar dentro del máximo de la etapa 1.',
          correct: false,
          why: 'No pueden solaparse: la etapa 2 depende del resultado de la etapa 1. Los `await` marcan puntos de sincronización, no sugerencias.',
        },
      ],
      takeaway: 'Fórmula para grafos por etapas: sumás lo secuencial, tomás el máximo en lo paralelo.',
    },
    {
      id: 'c2-c1c',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el riesgo escondido de este shape (fan-out → usar el resultado → fan-out)?',
      snippet: `
const shipments = await Promise.all(
  orders.map((o) => fetchShipment(o.shipmentId)),
);
`,
      choices: [
        {
          text: 'La etapa 2 tiene ancho variable: es un N+1 sobre HTTP.',
          correct: true,
          why: 'Con pocos pedidos anda; con muchos, saturás el servicio de envíos. La respuesta es endpoint batch (una llamada por muchos ids) o límite de concurrencia.',
        },
        {
          text: 'Que si un envío falla, se pierden `profile` y `orders` que sí llegaron.',
          correct: false,
          why: 'Los datos ya están en variables locales cuando la etapa 2 empieza. El fallo hace rechazar la función, pero no "pierde" datos ya asignados; es un problema de manejo de error, no del shape.',
        },
        {
          text: 'Que `shipments[i]` puede no corresponder a `orders[i]` sin `.map` con índice.',
          correct: false,
          why: '`Promise.all` preserva orden posicional. `shipments[i]` sí corresponde a `orders[i]` — es una garantía de la spec.',
        },
        {
          text: 'Que el segundo `await` bloquea las serializaciones del primero.',
          correct: false,
          why: 'No hay "serializaciones del primero" que quedaran pendientes: el primer `await` ya resolvió antes de arrancar la segunda etapa.',
        },
      ],
    },
    {
      id: 'c2-n3',
      kind: 'numeric',
      prompt:
        'Tenés que llamar a 6 APIs independientes de 100ms cada una, pero tu pool sólo te permite 2 requests en vuelo a la vez. ¿Latencia total?',
      answer: 300,
      unit: 'ms',
      why: '6 tareas / 2 de concurrencia = 3 tandas × 100ms = 300ms. Para tareas de duración pareja la fórmula es ceil(N / límite) × duración. Compará: 600ms totalmente secuencial, 100ms sin límite, 300ms acá. El límite de concurrencia es exactamente el dial entre TU latencia y la CARGA que le ponés al downstream — el trade-off central del nivel 3.',
    },
    {
      id: 'c2-c2a',
      kind: 'multipleChoice',
      prompt: '¿Qué imprime esta función, y cuándo?',
      snippet: `
async function sendAll(messages) {
  messages.forEach(async (m) => {
    await send(m);
  });

  console.log('todos enviados');
  return true;
}
`,
      choices: [
        {
          text: '"todos enviados" inmediato, antes de que salga ninguno.',
          correct: true,
          why: '`forEach` no espera al callback async: dispara todas las invocaciones sincrónicamente, ignora las promesas que devuelven, y sigue de largo hasta el `console.log`.',
        },
        {
          text: '"todos enviados" al final: `forEach` con callback async espera implícitamente.',
          correct: false,
          why: 'Sería cierto con `for...of` + `await` o `await Promise.all(map(...))`. `forEach` no espera nada.',
        },
        {
          text: 'Nada: TypeScript rechaza pasar un callback async a `forEach`.',
          correct: false,
          why: 'TS lo acepta sintácticamente (aunque hay reglas de linter que lo advierten). Compila y corre — mal.',
        },
        {
          text: '"todos enviados" cuando termina el primero, gracias al microtask queue.',
          correct: false,
          why: '`forEach` no espera a NADIE. Ni al primero ni al último. El microtask queue no cambia eso.',
        },
      ],
    },
    {
      id: 'c2-c2b',
      kind: 'multipleChoice',
      prompt: 'Sobre ese mismo código, ¿cuál es el bug de fondo y cómo lo arreglás?',
      snippet: `
messages.forEach(async (m) => {
  await send(m);
});
`,
      choices: [
        {
          text: '`forEach` descarta las promesas del callback. Fix: `await Promise.all(map(...))`.',
          correct: true,
          why: 'Lo único que espera promesas en JS son `Promise.all/allSettled/race/any` y `for await`. `forEach/map/filter` no.',
        },
        {
          text: 'Falta un `try/catch` dentro del callback para que las promesas se conserven.',
          correct: false,
          why: 'Hay problema de errores no manejados, sí, pero es una consecuencia — no la causa. Aunque los envuelvas, `forEach` sigue sin esperarlos.',
        },
        {
          text: 'Cambiar `forEach` por `for...in` para iterar sobre las claves.',
          correct: false,
          why: '`for...in` itera sobre CLAVES enumerables (mala idea sobre arrays) y tampoco espera awaits automáticamente. Confunde dos malas ideas.',
        },
        {
          text: 'Anteponer `return` a `messages.forEach(...)` para propagar la espera.',
          correct: false,
          why: '`forEach` devuelve `undefined`. Retornarlo no te da una promesa para esperar.',
        },
      ],
      takeaway: '`forEach` no sabe nada de promesas. Para esperar N cosas: `Promise.all(map(...))`. Para secuencial: `for...of` con `await`.',
    },
    {
      id: 'c2-c3a',
      kind: 'multipleChoice',
      prompt: '¿En qué orden aparecen los `console.log` que están adentro de cada `delay`?',
      snippet: `
const delay = (ms, tag) =>
  new Promise((res) =>
    setTimeout(() => { console.log('fin', tag); res(tag); }, ms));

async function main() {
  const ps = [delay(300, 'A'), delay(100, 'B'), delay(200, 'C')];
  const out = await Promise.all(ps);
  console.log('resultado', out);
}
`,
      choices: [
        {
          text: 'B → C → A (orden de resolución real).',
          correct: true,
          why: 'Los `console.log` internos se ejecutan cuando dispara el `setTimeout` de cada promesa — y eso pasa cuando VENCE la duración, no en el orden en que se armó el array.',
        },
        {
          text: 'A → B → C (orden del array, sincronizado por `Promise.all`).',
          correct: false,
          why: 'Ese es el orden POSICIONAL, y aplica al array de resultados que devuelve `Promise.all`, no a los efectos internos que ocurren en tiempo real.',
        },
        {
          text: 'A → B → C, todos juntos a los 300ms al resolver `Promise.all`.',
          correct: false,
          why: 'Cada `setTimeout` corre independiente. B termina a los 100ms haga lo que haga A. El `Promise.all` no reagrupa los efectos.',
        },
        {
          text: 'Sólo el último (fin A): los `console.log` anteriores caen en el microtask queue diferido.',
          correct: false,
          why: 'Los `console.log` corren dentro del callback del `setTimeout`, que ejecuta apenas vence el timer. Ninguno queda diferido a la resolución de `Promise.all`.',
        },
      ],
    },
    {
      id: 'c2-c3b',
      kind: 'multipleChoice',
      prompt: '¿Qué imprime la última línea, `console.log("resultado", out)`?',
      snippet: `
const ps = [delay(300, 'A'), delay(100, 'B'), delay(200, 'C')];
const out = await Promise.all(ps);
console.log('resultado', out);
`,
      choices: [
        {
          text: '`resultado [ "A", "B", "C" ]`.',
          correct: true,
          why: '`Promise.all` respeta orden posicional del array de entrada. Por eso el destructuring `const [a, b, c] = await Promise.all([...])` es seguro.',
        },
        {
          text: '`resultado [ "B", "C", "A" ]` — orden en que fueron resolviendo.',
          correct: false,
          why: 'Es el orden en que salen los `console.log` internos, pero NO el del array. Son dos relojes distintos.',
        },
        {
          text: '`resultado [ "B" ]` — se queda con la primera que resuelve.',
          correct: false,
          why: '`Promise.all` espera a todas y devuelve todos los resultados. La que se queda con la primera es `Promise.race`.',
        },
        {
          text: '`resultado undefined` porque `out` no se llegó a asignar sincrónicamente.',
          correct: false,
          why: 'Ese log corre DESPUÉS del `await`, así que `out` ya está asignado con el array completo.',
        },
      ],
      takeaway: 'Dos relojes: cuándo ocurre cada efecto (resolución) vs. cómo se entregan los resultados (posicional).',
    },
    {
      id: 'c2-c3c',
      kind: 'multipleChoice',
      prompt: '¿Cuánto tarda `main()` en total?',
      snippet: `
const ps = [delay(300, 'A'), delay(100, 'B'), delay(200, 'C')];
const out = await Promise.all(ps);
`,
      choices: [
        {
          text: '~300ms.',
          correct: true,
          why: '`Promise.all` termina cuando termina la ÚLTIMA. Las tres promesas ya arrancaron al construir el array (son eager), así que el total = max(300, 100, 200) = 300.',
        },
        {
          text: '~600ms: suma de las tres, arrancan cuando llega el `await`.',
          correct: false,
          why: 'Las promesas arrancan al CREARSE (son eager), no al `await`. Y aunque arrancaran secuenciales, la suma es 300+100+200 = 600 — pero acá corren en paralelo.',
        },
        {
          text: '~200ms: promedio de las tres duraciones.',
          correct: false,
          why: 'No hay promedio: la latencia paralela es el MÁXIMO, no la media aritmética. 200ms sería casualidad numérica, no la regla.',
        },
        {
          text: '~100ms: la primera que resuelve libera el `await Promise.all`.',
          correct: false,
          why: 'Sería `Promise.race`, que resuelve con la PRIMERA. `Promise.all` espera a TODAS.',
        },
      ],
    },
    {
      id: 'c2-n4',
      kind: 'numeric',
      prompt:
        'Un middleware hace: (1) validar el JWT contra auth (80ms); (2) con el userId, en paralelo: permisos (120ms), feature flags (60ms) y perfil (200ms); (3) con los permisos, llamar a facturación (150ms); (4) serializar (10ms). ¿Latencia total?',
      answer: 440,
      unit: 'ms',
      hint: 'etapa por etapa',
      why: '80 + max(120, 60, 200) + 150 + 10 = 440ms. Ahora el detalle que se le escapa a mucha gente: facturación sólo depende de PERMISOS (120ms), pero igual espera a que termine todo el Promise.all —o sea, al perfil de 200ms— porque el fan-in espera a todas. Si encadenaras facturación apenas vuelven los permisos, esa rama sería 120+150 = 270ms, el perfil (200ms) correría por debajo, y el total bajaría a 80 + 270 + 10 = 360ms. Esa es la diferencia entre un fan-in ciego y encadenar por dependencia real: 80ms gratis.',
    },
    {
      id: 'c2-d2',
      kind: 'diagram',
      title: 'El mismo endpoint como diagrama de secuencia',
      ascii: `
Cliente        Middleware        Auth        Perfil      Pedidos
   │                │              │            │            │
   │─ GET /dash ───▶│              │            │            │
   │                │─ validate ──▶│            │            │
   │                │◀── userId ───│            │            │  t=80ms
   │                │              │            │            │
   │                │─ GET profile ────────────▶│            │  ┐
   │                │─ GET orders ──────────────────────────▶│  │ las dos
   │                │              │            │            │  │ en vuelo
   │                │◀── 200 ───────────────────│            │  │ a la vez
   │                │              │            │            │  ┘
   │                │◀── 200 ────────────────────────────────│  t=380ms
   │◀── 200 JSON ───│              │            │            │
`,
      caption:
        'Dos flechas de salida seguidas, sin respuesta en el medio: esa es la firma visual del fan-out. Si estuvieran intercaladas (pido → me responden → pido) el diagrama estaría diciendo "secuencial". Cuando dibujes uno para explicar una optimización, esto es lo primero que va a mirar quien lo lea. (Puente con la Sección B, nivel 2.)',
    },
    {
      id: 'c2-q2',
      kind: 'multipleChoice',
      prompt:
        'Tu endpoint hace un request por cada uno de los 200 ítems de un carrito, todos contra el mismo servicio, con Promise.all. En staging con 3 ítems anda perfecto. ¿Cuál es la lectura correcta?',
      choices: [
        {
          text: 'Es un N+1 sobre HTTP: si el servicio tiene endpoint batch, una sola llamada le gana al fan-out; si no lo tiene, hay que limitar la concurrencia.',
          correct: true,
          why: 'El fan-out arregla la latencia pero multiplica la carga. 200 requests simultáneos contra el mismo servicio es un pico que puede tirarlo o hacer que te throttlee, y el problema de fondo es de diseño de API, no de concurrencia.',
        },
        {
          text: 'Está bien: Promise.all es paralelo, así que tarda lo mismo que un solo request.',
          correct: false,
          why: 'En la teoría de latencia sí; en la práctica no, porque ni el servidor ni tu pool de conexiones atienden 200 cosas a la vez. Los requests hacen cola en algún lado —tu agente HTTP, el balanceador, el thread pool del otro— y la latencia real se degrada. Pero sólo lo ves con volumen, nunca en staging.',
        },
        {
          text: 'Hay que pasarlo a secuencial con un for...of.',
          correct: false,
          why: 'Es la sobrecorrección típica: 200 × 100ms = 20 segundos. La respuesta casi nunca es "todo o nada", es un límite de concurrencia (por ejemplo 10 en vuelo).',
        },
        {
          text: 'Conviene abrir 200 worker_threads.',
          correct: false,
          why: 'Los workers son para CPU. Acá no falta CPU: sobra concurrencia sin control. Agregar hilos no cambia cuántos requests aguanta el servicio del otro lado.',
        },
      ],
      takeaway: 'El fan-out cambia costo de LATENCIA por costo de CARGA. Siempre preguntate cuánto puede valer N.',
    },
    {
      id: 'c2-tf2',
      kind: 'trueFalse',
      statement:
        'Hacer await Promise.all([...]) dentro de un for sobre tandas de 10 es una forma válida de limitar la concurrencia.',
      answer: true,
      why: 'Es el chunking (o batching): partís las N tareas en tandas de tamaño fijo y esperás cada tanda. Es válido, no agrega dependencias y son cinco líneas. Su desventaja frente a un pool real (p-limit, o un semáforo hecho a mano): la tanda entera espera a su elemento más lento antes de arrancar la siguiente, así que hay slots ociosos. Con tareas de duración pareja la diferencia es despreciable; con duraciones muy dispares, un pool que repone de a uno rinde bastante más.',
    },
  ],
  summary: [
    'Fan-out = disparar N independientes a la vez (Promise.all); fan-in = esperarlas a todas.',
    'Cómo calcular latencia: recorré el grafo por etapas. Sumá lo secuencial, tomá el máximo dentro de cada etapa paralela.',
    'Promise.all devuelve los resultados en el orden del ARRAY DE ENTRADA, no en el de resolución.',
    'Rechaza fail-fast, pero NO cancela: las otras promesas siguen corriendo (y sus efectos también).',
    'forEach(async ...) no espera nada. Usá map + Promise.all, o for...of con await.',
    'Con concurrencia limitada L y N tareas parejas: ceil(N / L) × duración.',
    'El fan-out cambia latencia por carga. Si N puede ser grande: endpoint batch, o límite de concurrencia.',
  ],
};
