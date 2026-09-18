import type { Level } from '../../domain/section.js';

export const level3: Level = {
  level: 3,
  title: 'Fallos, límites y caché',
  goal: 'Al terminar vas a poder decidir, para un escenario concreto, qué técnica aplicar y en qué orden — y decir en voz alta qué resignás con cada una.',
  items: [
    {
      id: 'c3-t1',
      kind: 'theory',
      title: 'Cuando algo falla, el problema cambia',
      body: 'Promise.all es fail-fast: rechaza apenas rechaza la primera y te tira ESE error. Los otros resultados —incluidos los que sí salieron bien— se pierden, porque el await ya salió por el catch. Cuando eso es lo que querés, está perfecto. Cuando no, estás tirando trabajo que ya pagaste, y encima le devolvés un error al usuario teniendo la mitad de la respuesta en la mano.',
      analogy:
        'Un pedido con tres productos y falta uno. ¿Cancelás la compra entera, o mandás los dos que hay y avisás del tercero? Las dos respuestas son válidas y la elige el negocio, no el código. Promise.all es siempre la primera; allSettled te deja elegir.',
    },
    {
      id: 'c3-q1',
      kind: 'multipleChoice',
      prompt: '¿Qué devuelve Promise.allSettled([a, b, c]) si b rechaza?',
      choices: [
        {
          text: 'Una promesa que RESUELVE con tres objetos: dos { status: "fulfilled", value } y uno { status: "rejected", reason }.',
          correct: true,
          why: 'Espera a las tres y te entrega el resultado de cada una, exitosa o no, en el orden del array de entrada. La decisión de qué hacer con el fallo queda de tu lado.',
        },
        {
          text: 'Rechaza con el error de b, igual que Promise.all, pero recién después de esperar a las tres.',
          correct: false,
          why: 'Trampa buena porque la primera mitad es cierta: allSettled sí espera a todas, a diferencia de all. Pero nunca rechaza. Confundir "espera a todas" con "rechaza al final" es de los malentendidos más comunes.',
        },
        {
          text: 'Resuelve con un array de dos elementos, omitiendo el que falló.',
          correct: false,
          why: 'No filtra nada: mantiene la posición, y por eso podés correlacionar cada resultado con su entrada por índice. Si filtrara, perderías justamente la información de cuál falló.',
        },
        {
          text: 'Resuelve con los valores de a y c, y b queda como undefined.',
          correct: false,
          why: 'Sería cómodo y no es lo que hace, por una buena razón: undefined puede ser un valor legítimo. El objeto con status te dice sin ambigüedad si hubo fallo y cuál fue.',
        },
      ],
      takeaway:
        'all: si uno falla, no hay resultado. allSettled: siempre hay resultado, y vos decidís qué hacer con los fallos.',
    },
    {
      id: 'c3-d1',
      kind: 'diagram',
      title: 'Qué pasa cuando una falla',
      ascii: `
Promise.all                      A ─────────────►  ok  (200ms)
                                 B ──────X  falla (120ms)
                                 C ───────────────────► ok (300ms)
                                         │
                                  rechaza ACÁ, a los 120ms
                                    · A y C SIGUEN corriendo: no se cancelan
                                    · sus resultados se pierden
                                    · si C rechaza después, nadie la espera
                                      → posible unhandledRejection


Promise.allSettled               A ─────────────►
                                 B ──────X
                                 C ───────────────────►
                                                      │
                                       resuelve ACÁ, a los 300ms, con:
                                    [ { status: 'fulfilled', value },
                                      { status: 'rejected',  reason },
                                      { status: 'fulfilled', value } ]
`,
      caption:
        'Dos diferencias, no una. La obvia: all corta en el primer fallo y allSettled espera a todas. La que se olvida: NINGUNO de los dos cancela nada — en JS no existe cancelar una promesa, así que con all las otras siguen corriendo, sus efectos ocurren igual y el tiempo ya se gastó. Si querés cancelar de verdad, hace falta un AbortController pasado a cada operación.',
    },
    {
      id: 'c3-tf1',
      kind: 'trueFalse',
      statement: 'Promise.allSettled nunca rechaza.',
      answer: true,
      why: 'Nunca rechaza por un fallo de las promesas que le pasaste: siempre resuelve con el array de resultados. Y eso tiene una consecuencia peligrosa: si te olvidás de mirar los status, los errores desaparecen en silencio. Con all un fallo te explota en la cara; con allSettled tenés que ir a buscarlo. Por eso el patrón sano es filtrar explícito —const failed = results.filter((r) => r.status === "rejected")— y decidir qué hacer: loguear, emitir una métrica, encolar un reintento. allSettled no es "la versión segura" de all: es la versión que te transfiere a vos la responsabilidad del fallo.',
    },
    {
      id: 'c3-c1a',
      kind: 'multipleChoice',
      prompt: '¿Qué le pasa a tu dashboard con este código, considerando que `mlApi` tiene 99% de uptime?',
      snippet: `
async function getDashboard(userId: string) {
  const [profile, orders, recommendations] = await Promise.all([
    usersApi.get(userId),
    ordersApi.listFor(userId),
    mlApi.recommendations(userId),   // 99.0% de uptime
  ]);

  return { profile, orders, recommendations };
}
`,
      choices: [
        {
          text: 'Cae con el peor uptime: 1% de fallos → 1% de dashboards caídos.',
          correct: true,
          why: '`Promise.all` es fail-fast: si mlApi rechaza, la función entera rechaza y el usuario ve un error, no un dashboard sin recomendaciones. El endpoint hereda el peor uptime de sus dependencias.',
        },
        {
          text: '`recommendations` queda `undefined` y el resto se serializa igual.',
          correct: false,
          why: 'Con `Promise.all` no hay resultado parcial: rechaza y no llegás al `return`. Nada queda `undefined`; la función entera falla.',
        },
        {
          text: 'Se degrada al promedio: 3 al 99% dan ~99% de éxito para el dashboard.',
          correct: false,
          why: 'Es la trampa aritmética típica: se PROMEDIA en vez de MULTIPLICAR. La disponibilidad efectiva es 0.99³ ≈ 97%, y si UNA falla el usuario ya ve error.',
        },
        {
          text: 'El endpoint devuelve 200 con `mlApi` faltante gracias al fallback interno.',
          correct: false,
          why: 'No hay ningún fallback interno: `Promise.all` no atrapa fallos. La función rechaza y el response por defecto es 500.',
        },
      ],
    },
    {
      id: 'c3-c1b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la regla de diseño que aplica acá?',
      choices: [
        {
          text: 'Clasificar cada dependencia en ESENCIAL u OPCIONAL.',
          correct: true,
          why: 'La pregunta correcta es de producto: "¿la respuesta tiene sentido sin esto?". Sí → opcional (allSettled o catch con fallback). No → esencial (Promise.all).',
        },
        {
          text: 'Reemplazar todos los `Promise.all` por `Promise.allSettled`.',
          correct: false,
          why: 'Sobrecorrección. Si perfil falla, un dashboard sin perfil no tiene sentido — mejor fallar rápido y claro.',
        },
        {
          text: 'Envolver el bloque en `try/catch` y devolver `{}` en caso de error.',
          correct: false,
          why: 'Devuelve un dashboard vacío incluso cuando el fallo es en algo esencial. Confunde al usuario y esconde el bug.',
        },
        {
          text: 'Reintentar el bloque completo hasta que las tres respondan bien.',
          correct: false,
          why: 'Con dependencias caídas, reintentar el bloque completo re-dispara las que sí funcionaban y multiplica la carga. El problema es de clasificación, no de retry.',
        },
      ],
      takeaway: 'Tu disponibilidad es el PRODUCTO de las de tus dependencias. Tres al 99% = 97% ≈ 22h caídas/mes.',
    },
    {
      id: 'c3-c1c',
      kind: 'multipleChoice',
      prompt: '¿Cómo re-escribirías el dashboard aplicando esa regla?',
      snippet: `
// perfil y pedidos son ESENCIALES; recomendaciones es OPCIONAL
`,
      choices: [
        {
          text: 'Esenciales con `Promise.all`; `mlApi` aparte con `.catch(() => [])`.',
          correct: true,
          why: 'Los esenciales fallan rápido y devuelven error claro. La opcional degrada suavemente: si mlApi cae, `recommendations = []` y el front muestra el resto.',
        },
        {
          text: 'Un `Promise.allSettled` para las tres y filtrar los `fulfilled`.',
          correct: false,
          why: 'Trata iguales a esenciales y opcionales. Si perfil falla, seguís devolviendo un dashboard sin perfil — que no tiene sentido.',
        },
        {
          text: '`Promise.race` entre `mlApi` y un timeout corto de 500ms.',
          correct: false,
          why: 'Ayuda con LATENCIA de mlApi, no con su UPTIME. Si rechaza rápido, igual tirás el dashboard entero.',
        },
        {
          text: 'Reintentar `mlApi` con backoff antes del `Promise.all`.',
          correct: false,
          why: 'Suma latencia al camino más frecuente para tapar el 1%. Y si el servicio está roto, reintentar no termina nunca.',
        },
      ],
      codeExample: `async function getDashboard(userId: string) {
  const [profile, orders] = await Promise.all([
    usersApi.get(userId),
    ordersApi.listFor(userId),
  ]);

  const recommendations = await mlApi
    .recommendations(userId)
    .catch(() => []); // opcional: fallback silencioso

  return { profile, orders, recommendations };
}`,
    },
    {
      id: 'c3-q2',
      kind: 'multipleChoice',
      prompt: '¿En cuál de estos casos querés Promise.all y NO allSettled?',
      choices: [
        {
          text: 'Validar un pedido antes de cobrar: chequear stock, precio vigente y método de pago. Si cualquiera falla, no hay pedido posible.',
          correct: true,
          why: 'Fail-fast es exactamente lo que querés: si el servicio de stock no responde, no vas a cobrar "igual". Y de paso te ahorra esperar a las otras dos cuando ya sabés que la operación no va a proceder.',
        },
        {
          text: 'Mandar notificaciones por email, SMS y push al mismo usuario.',
          correct: false,
          why: 'Cada canal es independiente: que falle el SMS no debería impedir que salga el email. Con all, el primer fallo aborta la espera y ni te enterás de cuáles salieron.',
        },
        {
          text: 'Traer los datos de 50 productos para armar un listado.',
          correct: false,
          why: 'Si uno falla querés mostrar 49 con un hueco, no una pantalla de error entera. Es el caso de degradación parcial por excelencia.',
        },
        {
          text: 'Refrescar tres cachés en background después de un deploy.',
          correct: false,
          why: 'Nada de lo que hace el usuario depende de que terminen. Querés que corran todas y loguear las que fallen, que es literalmente lo que hace allSettled.',
        },
      ],
    },
    {
      id: 'c3-t2',
      kind: 'theory',
      title: 'Límite de concurrencia',
      body: 'Promise.all sobre 10.000 items no lanza 10.000 requests "rápido": los lanza TODOS en el mismo tick. Y lo que se rompe no es sólo el servidor del otro lado: se llenan los sockets del agente HTTP, la memoria crece con 10.000 promesas y sus buffers, el DNS recibe 10.000 resoluciones, y el downstream empieza a devolver 429 o a cerrar conexiones. La respuesta no es volver a secuencial: es poner un techo.',
      analogy:
        'Una autopista. Sumar autos aumenta el flujo total hasta cierto punto; pasado ese punto, cada auto extra hace que TODOS vayan más lento. El límite de concurrencia es el semáforo de la rampa de acceso: deja entrar de a poco justamente para que el conjunto llegue antes.',
    },
    {
      id: 'c3-q3',
      kind: 'multipleChoice',
      prompt:
        'Hacés await Promise.all(ids.map((id) => api.get(id))) con 10.000 ids. ¿Qué es lo primero que se rompe?',
      choices: [
        {
          text: 'Depende del sistema, y por eso hay que medirlo: se agotan los sockets del agente HTTP, o el downstream te throttlea con 429, o la memoria crece con 10.000 promesas en vuelo.',
          correct: true,
          why: 'No hay un único punto de falla y ése es el punto: el límite correcto se descubre midiendo contra TU downstream, no eligiendo un número lindo. Y casi siempre el primero en quejarse es el del otro lado, no vos.',
        },
        {
          text: 'Nada: Node maneja la concurrencia solo y las va a encolar.',
          correct: false,
          why: 'El agente HTTP sí tiene un maxSockets que encola, y eso hace el problema INVISIBLE hasta que los timeouts empiezan a vencer mientras el request esperaba en tu propia cola local. "Encolar" no es "estar bien": es acumular latencia donde no la ves.',
        },
        {
          text: 'El event loop se bloquea porque son demasiadas operaciones simultáneas.',
          correct: false,
          why: 'El event loop no se bloquea con I/O — ése es todo el punto de Node. Lo que se agota son recursos (sockets, memoria, la capacidad del otro lado), no el hilo de JS.',
        },
        {
          text: 'Se pierde el orden de los resultados.',
          correct: false,
          why: 'Promise.all preserva el orden del array de entrada sin importar cuántos elementos sean. El volumen no cambia esa garantía.',
        },
      ],
      takeaway: 'El límite no se elige: se mide. Y el primero en romperse suele ser el downstream.',
    },
    {
      id: 'c3-d2',
      kind: 'diagram',
      title: 'Sin límite vs con límite',
      ascii: `
SIN LÍMITE                          CON LÍMITE (4 en vuelo)
12 tareas lanzadas en el mismo tick  12 tareas, pool de 4

  ████████████████████  ┐             ████                tanda 1
  ████████████████████  │             ████                tanda 2
  ████████████████████  │  las 12     ████                tanda 3
  ████████████████████  │  a la vez   ████
  ████████████████████  │             ████
  ████████████████████  │             ████
  ████████████████████  ┘             ████
  └──────────────────┘                └──────────┘
   cada una tarda MÁS:                 ceil(12/4) × 100ms = 300ms
   la cola está del otro lado          predecible, y el downstream
                                       no se entera

  lo que se rompe primero:
   · sockets del agente HTTP
   · 429 / conexiones cerradas del downstream
   · memoria con N promesas y buffers en vuelo
`,
      caption:
        'El dibujo de la izquierda es la trampa: parece que "todo en paralelo" tiene que ser más rápido, y pasado el punto de saturación cada tarea empieza a tardar más porque la cola simplemente se mudó al otro lado. El límite de concurrencia no es una concesión de seguridad que te cuesta velocidad — muchas veces es literalmente más rápido, además de no romper nada.',
    },
    {
      id: 'c3-n1',
      kind: 'numeric',
      prompt:
        'Tenés 500 llamadas independientes de 80ms cada una, con un límite de 25 en vuelo. ¿Cuánto tarda el lote completo?',
      answer: 1600,
      unit: 'ms',
      why: 'ceil(500 / 25) = 20 tandas × 80ms = 1600ms. La fórmula para tareas parejas es siempre ceil(N / límite) × duración. Los tres puntos de referencia que conviene tener en la cabeza: secuencial serían 40 segundos, sin límite serían 80ms teóricos (y muy probablemente un incidente), y con el techo son 1,6 segundos predecibles. El límite es el dial entre tu latencia y la carga que le ponés al de al lado.',
    },
    {
      id: 'c3-n2',
      kind: 'numeric',
      prompt:
        'Otro caso: 200 llamadas. Con 20 en vuelo el downstream responde en 100ms, pero si subís a 40 su latencia se degrada a 250ms por llamada. ¿Cuánto tarda el lote con límite 40?',
      answer: 1250,
      unit: 'ms',
      hint: 'primero las tandas, después la duración degradada',
      why: 'ceil(200 / 40) = 5 tandas × 250ms = 1250ms. Ahora la parte importante: con límite 20 son ceil(200 / 20) = 10 tandas × 100ms = 1000ms. Subir la concurrencia lo hizo MÁS LENTO. Es el efecto que ves en cualquier sistema con cola: pasado el punto de saturación, la latencia de todos crece más rápido de lo que crece el throughput. Por eso el límite no se elige "lo más alto que aguante": se mide, y el óptimo casi siempre es más bajo de lo que uno espera.',
    },
    {
      id: 'c3-c2a',
      kind: 'multipleChoice',
      prompt: 'Ambas versiones limitan la concurrencia a 10. ¿Cuál es la diferencia de comportamiento?',
      snippet: `
// A — chunking
for (let i = 0; i < ids.length; i += 10) {
  const batch = ids.slice(i, i + 10);
  await Promise.all(batch.map((id) => api.get(id)));
}

// B — pool
const limit = pLimit(10);
await Promise.all(ids.map((id) => limit(() => api.get(id))));
`,
      choices: [
        {
          text: 'A espera a que termine la tanda entera; B repone slots apenas termina una.',
          correct: true,
          why: 'El chunking usa `Promise.all` por tanda, que es fan-in ciego: los 9 que terminaron temprano esperan al más lento. El pool repone slot por slot.',
        },
        {
          text: 'A es fair-scheduling; B usa cola FIFO estricta.',
          correct: false,
          why: 'Ninguno implementa fair-scheduling. Y B con `pLimit` sí procesa en orden FIFO por default, pero eso no es lo que los distingue: la diferencia es CÓMO reponen los slots.',
        },
        {
          text: 'A limita a 10 simultáneas; B a 10 por segundo (rate).',
          correct: false,
          why: 'Ni A ni B implementan rate limiting por ventana de tiempo. Los dos son "10 en vuelo simultáneas".',
        },
        {
          text: 'B libera memoria a medida que resuelve; A la acumula hasta el final del bucle.',
          correct: false,
          why: 'En los dos casos las promesas se resuelven y liberan cuando terminan. No es un tema de memoria.',
        },
      ],
    },
    {
      id: 'c3-c2b',
      kind: 'multipleChoice',
      prompt: '¿Cuándo importa esa diferencia?',
      choices: [
        {
          text: 'Cuando las duraciones son DISPARES entre tareas.',
          correct: true,
          why: 'Si en cada tanda de 10 hay una de 2s y nueve de 50ms, A tarda 2s por tanda mientras B llena los huecos apenas terminan las rápidas. Con todo pareja, ambos tardan ~lo mismo.',
        },
        {
          text: 'Cuando el volumen total supera cierto umbral (~1000 tareas).',
          correct: false,
          why: 'El volumen amplifica cualquier diferencia pero no la crea. Con 20 tareas de duraciones muy dispares, B ya gana claro.',
        },
        {
          text: 'Cuando el downstream aplica rate limit por ventana de tiempo.',
          correct: false,
          why: 'Rate limits por ventana piden CHUNKING con delay entre tandas, no pool. Es un motivo para preferir A, no un discriminador entre los dos.',
        },
        {
          text: 'Cuando corrés en un runtime sin `setImmediate` (browser/Deno).',
          correct: false,
          why: 'Ni A ni B dependen de `setImmediate`. El runtime no cambia el comportamiento comparativo de estos patrones.',
        },
      ],
      takeaway: 'Chunking: simple, con slots ociosos. Pool: siempre lleno, una dependencia más. Con duraciones dispares, el pool gana claro. Chunking gana cuando necesitás algo POR TANDA (checkpoint, rate limit por ventana).',
    },
    {
      id: 'c3-t3',
      kind: 'theory',
      title: 'Caché: qué resuelve y qué no',
      body: 'Un caché guarda el resultado de un trabajo para no volver a hacerlo. Resuelve consultas REPETIDAS, y no toca la latencia de la primera: si tu problema es que la primera llamada tarda 800ms, el caché no lo arregla — lo esconde para los que vengan después. Antes de cachear hay dos preguntas, y las dos son de datos, no de código: ¿cuántas veces se repite exactamente la misma consulta, y cuánto tolerás que el dato esté viejo?',
      analogy:
        'Anotar un teléfono en la agenda. La primera vez lo buscás igual; a partir de ahí es instantáneo. Y si la persona cambia de número, tu agenda miente hasta que alguien se acuerde de actualizarla.',
    },
    {
      id: 'c3-q4',
      kind: 'multipleChoice',
      prompt:
        'Tu endpoint tarda 900ms y el 95% se va en una query pesada. Cada usuario lo llama una vez por sesión, y cada uno ve datos distintos. ¿Sirve cachear?',
      choices: [
        {
          text: 'No: sin repetición no hay hits. Un caché con hit rate cercano a cero sólo agrega memoria, invalidación y una fuente nueva de bugs.',
          correct: true,
          why: 'El caché no acelera nada: evita repetir. Si no hay repetición, no hay nada que evitar. Acá lo que hay que arreglar es la query, o precalcular el resultado.',
        },
        {
          text: 'Sí: el caché siempre mejora la latencia promedio.',
          correct: false,
          why: 'Sólo si hay repetición. Con hit rate cero el promedio queda igual y encima le sumás el overhead de consultar el caché en cada request.',
        },
        {
          text: 'Sí, cacheando por usuario con un TTL corto.',
          correct: false,
          why: 'Es lo que suena razonable y no cambia nada: si cada usuario llama una vez por sesión, su propia entrada nunca llega a reusarse antes de expirar. Cachear por una clave que no se repite es cachear al vacío.',
        },
        {
          text: 'Sí, pero sólo si usás Redis en vez de memoria del proceso.',
          correct: false,
          why: 'Dónde vivan los datos no crea repetición donde no la hay. Redis resuelve otro problema —compartir el caché entre instancias— que acá tampoco existe.',
        },
      ],
      takeaway: 'El caché no acelera: evita repetir. Medí la repetición ANTES de la latencia.',
    },
    {
      id: 'c3-n3',
      kind: 'numeric',
      prompt:
        'Una consulta tarda 400ms sin caché y 5ms con hit. Con un hit rate del 80%, ¿cuál es la latencia promedio?',
      answer: 84,
      unit: 'ms',
      why: '0,8 × 5 + 0,2 × 400 = 4 + 80 = 84ms. Dos lecturas que importan más que el número. Primera: el p50 se desploma a 5ms pero el p95 SIGUE siendo 400ms — el caché mejora el promedio y no toca la cola, y tus usuarios más enojados viven en la cola. Segunda: el resultado es muy sensible al hit rate. Con 50% serían 202ms; con 95%, 24ms. Por eso lo primero que hay que medir antes de cachear no es la latencia: es cuántas veces se repite la misma clave.',
    },
    {
      id: 'c3-q5',
      kind: 'multipleChoice',
      prompt:
        'Tu caché tiene TTL de 60s sobre una query que tarda 2s, y el endpoint recibe 500 req/s. ¿Cuál es el riesgo más serio?',
      choices: [
        {
          text: 'Cache stampede: cuando la entrada expira, los ~1000 requests que llegan durante esos 2 segundos fallan el caché a la vez y disparan 1000 queries idénticas.',
          correct: true,
          why: 'Es un pico de carga periódico y sincronizado, cada 60 segundos, contra la query más cara que tenés. Las soluciones: compartir la promesa (el primero que falla el caché dispara la query y los demás se cuelgan de la MISMA promesa — exactamente lo que hace loadSection en este repo), refrescar antes de que expire, o meterle jitter al TTL para desincronizar las claves.',
        },
        {
          text: 'Que los usuarios vean datos de hasta 60 segundos de antigüedad.',
          correct: false,
          why: 'Es el costo que ya aceptaste al elegir ese TTL: es una decisión de producto conocida, no un riesgo latente. Los riesgos son los que no elegiste.',
        },
        {
          text: 'Que el caché consuma demasiada memoria.',
          correct: false,
          why: 'Con una sola clave, no. Sería un problema real con cardinalidad alta (cachear por usuario, por ejemplo) y sin límite de tamaño ni política de evicción.',
        },
        {
          text: 'Que el caché quede desincronizado entre instancias.',
          correct: false,
          why: 'Es real si tenés varias instancias con caché en memoria, y produce hit rate más bajo y ventanas de inconsistencia. Pero es menos grave que un pico sincronizado de 1000 queries pesadas cada minuto.',
        },
      ],
    },
    {
      id: 'c3-c3a',
      kind: 'multipleChoice',
      prompt: 'En este job nocturno de 40.000 productos, ¿cuál es la PRIMERA técnica que aplicás y por qué?',
      snippet: `
// Job nocturno: refrescar el precio de todos los productos del catálogo.
const products = await db.products.findAll();            // ~40.000 filas

const prices = await Promise.all(
  products.map((p) => pricingApi.quote(p.sku)),          // ~150ms cada una
);

await db.prices.bulkUpsert(prices);
`,
      choices: [
        {
          text: 'Límite de concurrencia sobre `pricingApi`.',
          correct: true,
          why: 'Primero lo que evita ROMPER algo. Un pool de 20 a 50, medido contra ese downstream. Después vienen los demás refinamientos.',
        },
        {
          text: '`Promise.allSettled` para no descartar trabajo ante un fallo aislado.',
          correct: false,
          why: 'Es importante, pero SEGUNDO. Antes hay que asegurar que el job no le rompa el nariz al downstream: eso te va a hacer fallar mucho más que un item aislado.',
        },
        {
          text: 'Caché con TTL para acelerar consultas repetidas de sku.',
          correct: false,
          why: 'Cada sku se consulta UNA vez por corrida. Hit rate cero → el caché sólo suma problemas sin resolver nada.',
        },
        {
          text: 'Retry con backoff exponencial en cada `pricingApi.quote`.',
          correct: false,
          why: 'Sin límite de concurrencia, los reintentos amplifican el pico. Además, el problema principal es el shape (40k en paralelo), no fallos aislados.',
        },
      ],
      takeaway: 'Orden: primero no romper (límite), después no perder trabajo (allSettled + checkpoint), al final optimizar (batch).',
    },
    {
      id: 'c3-c3b',
      kind: 'multipleChoice',
      prompt: 'Ya con el límite de concurrencia puesto, ¿qué te falta agregar para que el job sea confiable?',
      snippet: `
// ya tenés: pool de 25 en vuelo contra pricingApi
`,
      choices: [
        {
          text: '`allSettled` + checkpoint para reanudar.',
          correct: true,
          why: 'En un job de 40k items, `Promise.all` fail-fast tira todo el progreso al primer fallo, y un crash a mitad de camino te obliga a empezar de cero. Los dos son perdedores de trabajo.',
        },
        {
          text: '`Promise.race` con un timeout global de 5 minutos por seguridad.',
          correct: false,
          why: 'Cortar el job al vencer el timeout DESCARTA el trabajo ya hecho. Justo lo opuesto a lo que necesitás en un job largo.',
        },
        {
          text: '`try/catch` global que devuelva `[]` si algo revienta.',
          correct: false,
          why: 'Tira todo el resultado si un solo item falla. Igual de malo que `Promise.all` fail-fast, sólo que en silencio.',
        },
        {
          text: 'Nada más: con el límite ya no puede romperse el job.',
          correct: false,
          why: 'El límite protege al DOWNSTREAM, no a tu trabajo. Un fallo aislado igual mata el job entero con `Promise.all`.',
        },
      ],
    },
    {
      id: 'c3-c3c',
      kind: 'multipleChoice',
      prompt: 'De todas las técnicas del nivel 3, ¿por qué la CACHÉ es la única que NO ayuda acá?',
      snippet: `
const prices = await Promise.all(
  products.map((p) => pricingApi.quote(p.sku)),
);
`,
      choices: [
        {
          text: 'Hit rate cero: cada sku se consulta una sola vez.',
          correct: true,
          why: 'La caché no acelera: evita REPETIR. Sin repetición dentro de la misma corrida, no hay nada que evitar.',
        },
        {
          text: 'Los precios cambian frecuentemente y quedarían desactualizados.',
          correct: false,
          why: 'Un TTL corto lo maneja. El problema real no es freshness, es que no hay repetición: aunque los precios fueran estáticos, tampoco ayudaría.',
        },
        {
          text: '40.000 entradas exceden el tamaño típico de un LRU en memoria.',
          correct: false,
          why: '40k claves entran perfectamente en cualquier proceso Node moderno. No es un problema de tamaño.',
        },
        {
          text: '`pricingApi` ya cachea del lado servidor y agregar otra capa lo invalida.',
          correct: false,
          why: 'No lo sabés desde tu lado, y aunque fuera cierto no invalida la de ellos. Sigue habiendo hit rate cero de tu lado.',
        },
      ],
      takeaway: 'Antes de cachear medí la REPETICIÓN, no la latencia. Es el error de diseño que más se ve: "es lento → cacheá" sin preguntar cuántas veces se repite la clave.',
      codeExample: `// versión final del job:
const limit = pLimit(25);                        // 1. no romper
const results = await Promise.allSettled(        // 2. no perder trabajo
  products.map((p) => limit(() => pricingApi.quote(p.sku))),
);
const prices = results
  .filter((r) => r.status === 'fulfilled')
  .map((r) => r.value);
const failed = results
  .filter((r) => r.status === 'rejected')
  .map((r, i) => ({ sku: products[i].sku, reason: r.reason }));

await db.prices.bulkUpsert(prices);
await retryQueue.enqueue(failed);                // reintentos por afuera`,
    },
    {
      id: 'c3-tf2',
      kind: 'trueFalse',
      statement: 'Si una consulta es lenta, cachearla siempre mejora la experiencia del usuario.',
      answer: false,
      why: 'Mejora la de los que llegan DESPUÉS del primero, y sólo si vuelven a pedir lo mismo antes de que expire. El primero paga los 800ms completos — y si el caché queda frío después de cada deploy, ese "primero" se repite varias veces por día, justo en los momentos de más atención. Además el caché suma tres problemas nuevos: datos viejos (hay que decidir cuánto se tolera y quién lo decide), invalidación (el problema difícil de verdad), y un modo de falla más para debuggear, porque ahora "a mí me anda" tiene una explicación adicional. Si la consulta es lenta y no se repite, lo que hay que arreglar es la consulta.',
    },
  ],
  summary: [
    'Promise.all es fail-fast y descarta el trabajo que sí salió bien. allSettled espera a todas y te pasa a vos la responsabilidad del fallo.',
    'Ninguno de los dos CANCELA nada: en JS no se cancela una promesa. Para eso, AbortController.',
    'Clasificá cada dependencia en esencial u opcional. Tu disponibilidad es el PRODUCTO de las de todas: tres al 99% te dejan al 97%.',
    'Sin límite de concurrencia, la cola se muda al otro lado: se rompen sockets, memoria o el downstream con 429.',
    'ceil(N / límite) × duración. Y más concurrencia puede ser MÁS LENTO pasado el punto de saturación.',
    'Chunking: simple, con slots ociosos. Pool: siempre lleno, una dependencia más. Con duraciones dispares, el pool gana claro.',
    'El caché no acelera: evita REPETIR. Sin repetición, hit rate cero y sólo sumás problemas.',
    'Antes de cachear medí la repetición, no la latencia. Y acordate del stampede al expirar.',
    'Orden para diseñar un job: primero no romper (límite), después no perder trabajo (allSettled + checkpoint), al final optimizar (batch).',
  ],
};
