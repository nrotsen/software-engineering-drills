import type { Level } from '../../domain/section.js';

export const level2: Level = {
  level: 2,
  title: 'Leer y armar un diagrama de secuencia',
  goal: 'Al terminar vas a poder leer un diagrama de secuencia como se lee un stack trace, y dibujar uno que sirva para discutir latencia con tu equipo.',
  items: [
    {
      id: 'b2-t1',
      kind: 'theory',
      title: 'La anatomía: cinco elementos y ya',
      body: 'Un participante por columna, con su línea de vida cayendo hacia abajo. El eje vertical es el TIEMPO. Las flechas llenas son llamadas; las punteadas, respuestas. Y los recuadros con una etiqueta en la esquina son fragmentos: par para cosas que ocurren a la vez, alt para caminos alternativos, loop para repeticiones. Con eso alcanza para el 95% de los diagramas que vas a dibujar en tu vida.',
      analogy:
        'La transcripción de una llamada a varias bandas, con la hora al costado y corchetes que dicen "acá los dos hablaron al mismo tiempo" o "acá la conversación se bifurcó".',
    },
    {
      id: 'b2-d1',
      kind: 'diagram',
      title: 'El endpoint del dashboard, con fragmentos par y alt',
      ascii: `
 t       Cliente   Middleware    Auth    Permisos   Perfil   Facturación
           │           │          │         │         │          │
 0 ────────│─GET /dash▶│          │         │         │          │
           │           │─verify ─▶│         │         │          │
           │           │◀ userId ─│         │         │          │
 80ms ─────│───────────│──────────│─────────│─────────│──────────│
           │  ┌ par ───┼──────────┼─────────┼─────────┼────────┐ │
           │  │        │─ GET permisos 120ms▶         │        │ │
           │  │        │─ GET perfil 200ms ──────────▶│        │ │
           │  │        │◀── 200 ────────────│         │        │ │
 280ms ────│──│────────│◀── 200 ──────────────────────│        │ │
           │  └────────┼──────────┼─────────┼─────────┼────────┘ │
           │           │─ POST cargo 150ms ──────────────────────▶│
 430ms ────│───────────│◀───────── 200 ──────────────────────────│
           │  ┌ alt ───┼──────────────────────────────────────┐  │
           │◀─│ [ok]     200 JSON                             │  │
           │  ├ - - - - - - - - - - - - - - - - - - - - - - - ┤  │
           │◀─│ [sin permiso]  403                            │  │
           │  └──────────────────────────────────────────────-┘  │
`,
      caption:
        'Es el mismo endpoint que calculaste en la Sección C, ahora dibujado. Tres cosas que sólo se ven acá: el fragmento par dice que permisos y perfil salen a la vez (la latencia de esa etapa es el máximo, 200ms, no la suma); facturación arranca recién a los 280ms porque espera a TODO el par, aunque sólo necesite los permisos; y el alt muestra los dos finales posibles sin necesidad de un segundo diagrama. Los feature flags del ejercicio de C se omitieron a propósito: una tercera línea de vida que no cambia el argumento es ruido.',
    },
    {
      id: 'b2-q1',
      kind: 'multipleChoice',
      prompt:
        'En el diagrama de arriba, ¿qué información te da el recuadro "par" que no podrías deducir de las flechas solas?',
      choices: [
        {
          text: 'Que las llamadas de adentro ocurren simultáneamente, así que la duración de esa etapa es el máximo de las ramas y no la suma.',
          correct: true,
          why: 'Sin el recuadro, dos flechas seguidas son ambiguas: podrían ser secuenciales y el lector no tiene cómo saberlo. El par lo hace explícito, y con eso el cálculo de latencia deja de ser una interpretación.',
        },
        {
          text: 'Que las llamadas de adentro son opcionales.',
          correct: false,
          why: 'Eso lo indica un fragmento opt (opcional) o un alt. par no dice nada sobre si ocurren: dice que ocurren AL MISMO TIEMPO.',
        },
        {
          text: 'Que las llamadas de adentro se pueden reintentar si fallan.',
          correct: false,
          why: 'Los reintentos serían un loop con una guarda, o directamente una nota. par no habla de fallos.',
        },
        {
          text: 'Que las llamadas van a servicios distintos.',
          correct: false,
          why: 'Eso ya lo dicen las columnas de destino. El par agrega la dimensión temporal, que es justo lo que las columnas no pueden expresar.',
        },
      ],
      takeaway:
        'Dos flechas seguidas sin par son ambiguas. Si el diagrama es para hablar de latencia, el par no es decorativo.',
    },
    {
      id: 'b2-n1',
      kind: 'numeric',
      prompt:
        'El equipo de Perfil optimiza su endpoint y baja de 200ms a 90ms. Leyendo el diagrama, ¿cuál es la nueva latencia total, sin contar la serialización?',
      answer: 360,
      unit: 'ms',
      hint: 'volvé a mirar qué rama manda',
      why: '80 (auth) + max(120, 90) + 150 (facturación) = 80 + 120 + 150 = 360ms. Lo interesante no es el número: es que el CAMINO CRÍTICO SE MOVIÓ. Antes mandaba perfil con sus 200ms; ahora manda permisos con 120ms, y el próximo esfuerzo de optimización tiene que ir ahí. Un diagrama de secuencia con tiempos te deja hacer este análisis en la reunión, sin volver a instrumentar nada: por eso vale la pena escribir los milisegundos en las flechas.',
    },
    {
      id: 'b2-q2',
      kind: 'multipleChoice',
      prompt: '¿Qué significa que una flecha esté punteada en un diagrama de secuencia?',
      choices: [
        {
          text: 'Es una respuesta o retorno: la contestación a una llamada previa, no una llamada nueva.',
          correct: true,
          why: 'Es la convención UML y es la que espera cualquiera que lea diagramas. Distinguir llamada de retorno es lo que permite ver de un vistazo quién estuvo esperando y cuánto.',
        },
        {
          text: 'Es una llamada asincrónica que no espera respuesta.',
          correct: false,
          why: 'Es una confusión muy común. El fire-and-forget se dibuja con una flecha de punta ABIERTA (media punta), no punteada. La punteada siempre es un retorno.',
        },
        {
          text: 'Es una llamada opcional que puede no ocurrir.',
          correct: false,
          why: 'Lo opcional se marca con un fragmento opt o con una guarda entre corchetes. El estilo de línea no expresa condicionalidad.',
        },
        {
          text: 'Es una llamada a un sistema externo, fuera de tu control.',
          correct: false,
          why: 'Los sistemas externos son una columna más (a veces con otro color o un estereotipo). El estilo de la flecha habla de la naturaleza del mensaje, no de quién lo recibe.',
        },
      ],
    },
    {
      id: 'b2-c1a',
      kind: 'multipleChoice',
      prompt: '¿Dónde va el fragmento `par` al dibujar el diagrama de secuencia de este handler?',
      snippet: `
async function getCheckoutPage(req, res) {
  const session = await auth.getSession(req.cookies.sid);        // 60ms
  const cart = await carts.get(session.userId);                  // 90ms

  const [shipping, promos, savedCards] = await Promise.all([
    shippingApi.quote(cart.items, session.address),              // 250ms
    promoApi.forUser(session.userId),                            // 70ms
    paymentsApi.listCards(session.userId),                       // 110ms
  ]);

  res.json({ cart, shipping, promos, savedCards });
}
`,
      choices: [
        {
          text: 'Alrededor de shipping, promos y savedCards.',
          correct: true,
          why: 'Auth y carts son secuenciales (carts necesita `session.userId` que sale de auth). Las tres del Promise.all salen a la vez → van adentro del par.',
        },
        {
          text: 'Alrededor de carts y las tres del `Promise.all`, ya que comparten `session.userId`.',
          correct: false,
          why: 'Carts NO puede arrancar antes que auth: necesita `session.userId`. Meter todo en un par sería dibujar concurrencia donde no la hay.',
        },
        {
          text: 'Alrededor de auth y carts, que son las llamadas con `await` explícito.',
          correct: false,
          why: 'Al revés: auth y carts son las secuenciales. El fragmento par se usa cuando arrancan JUNTAS, no cuando esperan una a la otra.',
        },
        {
          text: 'No hace falta `par`: `Promise.all` ya lo comunica en el código.',
          correct: false,
          why: 'El código no es el diagrama. Sin `par` explícito, un lector no puede saber si tres flechas seguidas son concurrentes o secuenciales.',
        },
      ],
    },
    {
      id: 'b2-c1b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es la latencia total del handler según el diagrama?',
      snippet: `
auth (60ms) → carts (90ms) → par { shipping 250ms, promos 70ms, cards 110ms }
`,
      choices: [
        {
          text: '~400ms.',
          correct: true,
          why: 'Sumás lo secuencial (auth 60 + carts 90) y tomás el máximo dentro del par (shipping = 250ms). 60 + 90 + 250 = 400.',
        },
        {
          text: '~580ms, sumando las cinco llamadas.',
          correct: false,
          why: 'Sería si TODAS fueran secuenciales. Las tres del `Promise.all` van en paralelo.',
        },
        {
          text: '~250ms, el máximo global entre las cinco.',
          correct: false,
          why: 'Auth y carts corren ANTES del par (dependencia real). El máximo global no aplica: hay etapas.',
        },
        {
          text: '~340ms: max(60+250, 60+70, 60+110) más carts.',
          correct: false,
          why: 'Confunde el orden de etapas. Carts se ejecuta DESPUÉS de auth y ANTES del par, no en paralelo con él. Además, esa cuenta no cierra: da 340 pero por accidente.',
        },
      ],
    },
    {
      id: 'b2-c1c',
      kind: 'multipleChoice',
      prompt: '¿Qué optimización "obvia" NO mueve la aguja, y por qué?',
      snippet: `
// candidato: subir promos y savedCards a un Promise.all ANTES que carts
// (así arrancan junto con carts en vez de después)
`,
      choices: [
        {
          text: 'Subir promos y savedCards al primer nivel: el camino crítico pasa por shipping.',
          correct: true,
          why: 'shipping depende de `cart.items`, así que `auth → carts → shipping` es irreducible. Optimizar fuera del camino crítico no mueve el p50.',
        },
        {
          text: 'No hay ninguna optimización posible: el código ya está óptimo.',
          correct: false,
          why: 'Sí hay optimizaciones REALES (shipping por items sin esperar carrito, o caché), sólo que la "obvia" de subir promos y cards no es una.',
        },
        {
          text: 'Reemplazar `Promise.all` por `Promise.race` para cortar al primero.',
          correct: false,
          why: '`race` devuelve sólo el primero — necesitás los tres resultados para armar la respuesta.',
        },
        {
          text: 'Cachear shipping por `(sku, zona)` con TTL de cinco minutos.',
          correct: false,
          why: 'Esto SÍ movería la aguja: saca la llamada más pesada del camino crítico en el caso caliente. Pero la pregunta pide una optimización que NO mueve la aguja.',
        },
      ],
      takeaway: 'El diagrama muestra la CADENA MÁS LARGA de un vistazo. Optimizar afuera es refactor sin efecto en latencia.',
    },
    {
      id: 'b2-q3',
      kind: 'multipleChoice',
      prompt:
        'Estás dibujando el diagrama de un flujo de pago para una reunión de diseño. ¿Cuántos caminos de error dibujás?',
      choices: [
        {
          text: 'Los que sean el motivo de la reunión, y ninguno más. Si es una discusión de latencia, ninguno; si es de manejo de fallos, todos los relevantes.',
          correct: true,
          why: 'Cada alt duplica visualmente el diagrama. Los caminos de error que no vas a discutir sólo compiten por atención con lo que sí importa. Es la misma regla del nivel 1: el diagrama responde una pregunta.',
        },
        {
          text: 'Todos, porque un diagrama incompleto es peor que ninguno.',
          correct: false,
          why: 'Suena responsable y produce diagramas ilegibles. Un diagrama nunca es completo —siempre esconde algo— así que "completo" no es un objetivo alcanzable ni deseable.',
        },
        {
          text: 'Ninguno: los errores van en la documentación de la API, no en el diagrama.',
          correct: false,
          why: 'Si la reunión es justamente sobre qué hacer cuando el gateway timeoutea, el diagrama sin ese camino no sirve para nada. La lista de códigos de error va en la doc; la SECUENCIA de qué pasa tras un fallo se dibuja bien.',
        },
        {
          text: 'Sólo el más probable, para que el diagrama quede balanceado.',
          correct: false,
          why: 'La probabilidad no es el criterio: los caminos raros suelen ser justamente los que hay que diseñar con cuidado (el pago que se cobró pero no se registró). El criterio es la conversación.',
        },
      ],
    },
    {
      id: 'b2-tf1',
      kind: 'trueFalse',
      statement:
        'En un diagrama de secuencia conviene dibujar siempre las flechas de retorno, incluso cuando la respuesta no aporta nada.',
      answer: false,
      why: 'Las flechas de retorno se dibujan cuando el retorno IMPORTA: porque trae un dato que se usa después, o porque el que llamó se queda esperando y eso es parte del argumento. Si una llamada no devuelve nada relevante y nadie la espera, la flecha de vuelta es tinta que compite con el resto. La regla que se usa en la práctica: dibujá el retorno si el diagrama es sobre latencia (porque ahí la espera ES el tema) y omitilo si el diagrama es sobre el orden de las operaciones.',
    },
    {
      id: 'b2-c2a',
      kind: 'multipleChoice',
      prompt: 'Un compañero dibujó las dos primeras llamadas como ida-vuelta-ida-vuelta intercaladas. ¿Está bien?',
      snippet: `
const [inventory, pricing] = await Promise.all([
  inventoryApi.check(sku),
  pricingApi.quote(sku, customerTier),
]);
`,
      choices: [
        {
          text: 'No: el dibujo está diciendo secuencial, y el código es paralelo.',
          correct: true,
          why: 'Un diagrama incorrecto es peor que ninguno: tiene autoridad. Quien lo lea va a sumar las dos latencias en vez de tomar el máximo.',
        },
        {
          text: 'Sí: cada llamada dibujada con su respuesta es una convención válida.',
          correct: false,
          why: 'Lo que importa es que el ORDEN VISUAL comunique cuándo salió cada mensaje. Intercalar dice que se esperó a la primera antes de mandar la segunda.',
        },
        {
          text: 'Es aproximado: la precisión se completa hablando en la reunión.',
          correct: false,
          why: 'El diagrama sobrevive a la reunión. Alguien lo va a leer sin vos y a decidir con él. La forma es lo que comunica.',
        },
        {
          text: 'Está bien si las latencias se escriben al costado de cada flecha.',
          correct: false,
          why: 'Los números no contradicen el dibujo: refuerzan lo que el dibujo dice. Si el dibujo dice secuencial, dos latencias de 100ms se leen como 200ms totales.',
        },
      ],
    },
    {
      id: 'b2-c2b',
      kind: 'multipleChoice',
      prompt: '¿Cómo se corrige ese diagrama?',
      snippet: `
const [inventory, pricing] = await Promise.all([
  inventoryApi.check(sku),
  pricingApi.quote(sku, customerTier),
]);

if (!inventory.available) return { status: 'out_of_stock' };

const reservation = await inventoryApi.reserve(sku, qty);
`,
      choices: [
        {
          text: 'Envolver check y quote en un fragmento `par`; `reserve` queda afuera.',
          correct: true,
          why: 'Dos flechas de salida seguidas, sin respuesta en el medio, es la firma visual del paralelo. Y `reserve` sí es secuencial → afuera del par.',
        },
        {
          text: 'Anotar al costado "estas llamadas son concurrentes en runtime".',
          correct: false,
          why: 'Los diagramas de secuencia tienen notación para esto (`par`). Pedirle al lector que lea una nota para reinterpretar el dibujo es esquivar la corrección.',
        },
        {
          text: 'Meter check, quote y reserve dentro de un mismo `par`.',
          correct: false,
          why: 'Reserve depende de `inventory.available`: no arranca hasta que llegue la respuesta de check. No es concurrente con nada.',
        },
        {
          text: 'Separar inventory y pricing en columnas propias.',
          correct: false,
          why: 'La cantidad de columnas no arregla el ordenamiento temporal. Si las flechas siguen intercaladas, sigue leyéndose secuencial.',
        },
      ],
      takeaway: 'Dos flechas de SALIDA seguidas, sin respuesta en el medio = paralelo. Si alternan, es secuencial — aunque el autor haya querido decir otra cosa.',
    },
    {
      id: 'b2-t2',
      kind: 'theory',
      title: 'Qué NO poner en un diagrama de secuencia',
      body: 'Tres cosas lo arruinan sistemáticamente: nombres de métodos internos (el diagrama no es el código), toda la lógica condicional convertida en alts anidados (para eso está el de flujo), y participantes que aparecen una sola vez sin aportar al argumento. Si tu diagrama tiene más de siete columnas o más de quince flechas, casi siempre son dos diagramas peleando por el mismo espacio.',
      analogy:
        'Una foto de grupo con veinte personas: todos salen, nadie se distingue. Dos fotos de diez son más útiles que una de veinte, aunque tengas que sacar dos.',
    },
    {
      id: 'b2-q4',
      kind: 'multipleChoice',
      prompt:
        'Tu handler publica un evento en una cola y responde al cliente sin esperar al worker. ¿Cómo lo dibujás?',
      choices: [
        {
          text: 'Flecha de punta abierta hacia la cola (mensaje asincrónico, sin retorno), y la respuesta al cliente sale igual, sin depender de esa flecha.',
          correct: true,
          why: 'La media punta es la convención para "mando y sigo". Y lo que comunica el dibujo es lo importante: la respuesta al cliente no cuelga del worker, así que el trabajo del worker no está en el camino crítico.',
        },
        {
          text: 'Flecha llena a la cola y flecha punteada de vuelta, como cualquier llamada.',
          correct: false,
          why: 'Dibujás una espera que no existe. El lector va a sumar el tiempo del worker a la latencia del endpoint, que es justo la conclusión equivocada.',
        },
        {
          text: 'No se dibuja la cola: como es asincrónica, no forma parte de esta secuencia.',
          correct: false,
          why: 'Omitirla esconde información importante: que hay trabajo diferido y que existe una ventana donde el sistema está en un estado intermedio. Ese es exactamente el tipo de cosa que hay que discutir en diseño.',
        },
        {
          text: 'Una nota al costado que diga "async", porque los diagramas de secuencia no modelan colas.',
          correct: false,
          why: 'Sí las modelan: la cola es un participante como cualquier otro, y el worker es otro. La notación existe; no hace falta salirse a una nota.',
        },
      ],
      takeaway: 'Punta llena = espero. Punta abierta = mando y sigo. Punteada = retorno.',
    },
    {
      id: 'b2-q5',
      kind: 'multipleChoice',
      prompt:
        'Después de leer un diagrama de secuencia de tu sistema, ¿cuál es la pregunta más útil que podés hacerte?',
      choices: [
        {
          text: '"¿Cada flecha que espera a la anterior, la espera porque NECESITA su resultado?"',
          correct: true,
          why: 'Es la pregunta de la Sección C aplicada al dibujo, y es la que más rendimiento encuentra. En un diagrama, una dependencia falsa se ve como una flecha que arranca después de una respuesta que nunca usa.',
        },
        {
          text: '"¿Están todos los servicios del sistema representados?"',
          correct: false,
          why: 'No deberían estarlo: el diagrama muestra los participantes de ESTA interacción. Si están todos, probablemente sea un diagrama de arquitectura mal dibujado.',
        },
        {
          text: '"¿Los nombres de las flechas coinciden con los métodos del código?"',
          correct: false,
          why: 'Perseguir esa correspondencia es lo que hace que los diagramas se desactualicen a la semana. Las flechas nombran intenciones ("cobrar el pedido"), no firmas.',
        },
        {
          text: '"¿Está el manejo de errores de cada llamada?"',
          correct: false,
          why: 'Depende de para qué es el diagrama. Si es de latencia, agregar todos los alts lo vuelve ilegible sin aportar nada a la discusión que estás teniendo.',
        },
      ],
    },
  ],
  summary: [
    'Cinco elementos: columnas, línea de vida, flecha llena (llamada), punteada (retorno), fragmentos (par, alt, loop).',
    'Punta llena = espero. Punta abierta = mando y sigo (cola). Punteada = retorno.',
    'El fragmento par es lo que hace explícito el paralelismo. Sin él, dos flechas seguidas son ambiguas.',
    'Escribí los milisegundos en las flechas: te deja recalcular el camino crítico en la reunión.',
    'El camino crítico es la cadena más larga. Optimizar fuera de esa cadena no mueve la aguja.',
    'Un diagrama incorrecto es peor que ninguno: tiene autoridad y la gente decide con él.',
    'Más de siete columnas o quince flechas: son dos diagramas peleando por el mismo espacio.',
  ],
};
