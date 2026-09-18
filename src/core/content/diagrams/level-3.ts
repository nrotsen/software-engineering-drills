import type { Level } from '../../domain/section.js';

export const level3: Level = {
  level: 3,
  title: 'Elegir el diagrama correcto',
  goal: 'Al terminar vas a poder justificar por qué elegiste un tipo de diagrama para una audiencia concreta, y defender qué dejaste afuera.',
  items: [
    {
      id: 'b3-t0',
      kind: 'theory',
      title: 'Dos preguntas antes de dibujar',
      body: 'Quién lo va a leer, y qué decisión tiene que tomar después de leerlo. Con esas dos respuestas el tipo se elige casi solo: un flujo sirve para acordar reglas, uno de secuencia para acordar un rediseño de llamadas, uno de arquitectura para acordar dónde poner algo nuevo. Y si no podés nombrar la decisión, probablemente no necesites el diagrama.',
      analogy:
        'Antes de escribir un mail, saber a quién y para qué. El mismo contenido cambia entero si va a tu equipo o al directorio, y si es para informar o para pedir una aprobación.',
    },
    {
      id: 'b3-d1',
      kind: 'diagram',
      title: 'Qué captura cada tipo, y qué le queda ciego',
      ascii: `
                        FLUJO         SECUENCIA      ARQUITECTURA

  ¿qué pregunta        ¿qué pasa     ¿quién llama    ¿de qué piezas
   responde?            en cada       a quién y       está hecho y
                        caso?         cuándo?         qué se cae?

  participantes           ○              ●               ●
  tiempo / orden          ◐              ●               ○
  condiciones             ●              ◐               ○
  estructura estable      ○              ○               ●

  audiencia típica      producto       backend         alguien nuevo
                        QA             SRE             arquitectura
                                       performance     seguridad

  se desactualiza…      lento          rápido          medio
                        (las reglas    (el código      (la topología
                         cambian        cambia          cambia por
                         poco)          siempre)        trimestre)

   ● lo muestra bien     ◐ a medias     ○ no lo muestra
`,
      caption:
        'Los tres son ciegos en dos de las cuatro dimensiones, y eso no es un defecto: es lo que los hace legibles. La fila de "se desactualiza" es la que casi nunca se considera y la que más duele: un diagrama de secuencia atado al código de hoy va a mentir en tres sprints, así que o lo tratás como desechable (foto de la pizarra) o lo generás. Los de arquitectura de alto nivel son los únicos que rinden mantenidos a mano durante años.',
    },
    {
      id: 'b3-q1',
      kind: 'multipleChoice',
      prompt:
        'Escribís el postmortem de un incidente: un deploy del servicio de pagos dejó el checkout caído 20 minutos. ¿Qué diagrama DEL SISTEMA va en el documento?',
      choices: [
        {
          text: 'De arquitectura, marcando qué pieza falló y qué dependía de ella: el punto es explicar el radio de impacto.',
          correct: true,
          why: 'La pregunta que todo postmortem tiene que contestar es "¿por qué esto tumbó tanto?", y esa es una pregunta estructural. El diagrama muestra que pagos era un punto único de falla para el checkout, que es de donde salen las acciones correctivas.',
        },
        {
          text: 'De secuencia del checkout, para mostrar dónde se cortó la llamada.',
          correct: false,
          why: 'Es un buen complemento si el problema fueron timeouts encadenados o reintentos que amplificaron la carga. Pero no contesta la pregunta central del postmortem, que es de alcance, no de orden.',
        },
        {
          text: 'De flujo del proceso de checkout.',
          correct: false,
          why: 'Las reglas de negocio no cambiaron durante el incidente y el flujo no aporta nada. Es el diagrama que se pone cuando hay que poner alguno.',
        },
        {
          text: 'Un timeline del incidente, no un diagrama del sistema.',
          correct: false,
          why: 'El timeline es imprescindible y va sí o sí — pero cuenta qué hicieron las personas y cuándo, no por qué el impacto fue tan grande. Los dos van en el documento; la pregunta era cuál es el diagrama del SISTEMA.',
        },
      ],
    },
    {
      id: 'b3-q2',
      kind: 'multipleChoice',
      prompt:
        'Escribís un RFC para sacar el módulo de facturación del monolito a un servicio aparte. ¿Qué va como diagrama principal?',
      choices: [
        {
          text: 'Dos de arquitectura: el antes y el después. La decisión que estás pidiendo es estructural.',
          correct: true,
          why: 'El antes/después es lo que deja al lector evaluar qué cambia, qué dependencias aparecen y qué se rompe. Un RFC sin el "antes" le pide a cada lector que lo reconstruya de memoria, y cada uno lo reconstruye distinto.',
        },
        {
          text: 'Uno de arquitectura con el estado final propuesto.',
          correct: false,
          why: 'Falta la mitad del argumento. Sin el estado actual, el lector no puede juzgar el tamaño del cambio ni detectar la dependencia que vos no viste.',
        },
        {
          text: 'Uno de secuencia mostrando cómo quedarían las llamadas entre el monolito y el nuevo servicio.',
          correct: false,
          why: 'Excelente complemento —es donde se ve el costo de latencia de cruzar la red y las transacciones que dejan de ser atómicas— pero no es el diagrama principal de una decisión estructural.',
        },
        {
          text: 'Un flujo del proceso de facturación.',
          correct: false,
          why: 'El proceso de negocio no cambia: cambia dónde corre. Si el flujo cambiara, además, sería un RFC distinto y mucho más riesgoso.',
        },
      ],
    },
    {
      id: 'b3-c1a',
      kind: 'multipleChoice',
      prompt: '¿Qué diagrama ponés en la descripción de este PR ("checkout: bajar el p95 de 1.2s a 500ms")?',
      snippet: `
-  const user   = await users.get(id);
-  const cart   = await carts.get(id);
-  const promos = await promoApi.forUser(id);
+  const [user, cart, promos] = await Promise.all([...]);

-  const shipping = await shippingApi.quote(...);
+  const shipping = await shippingCache.getOrFetch(...);
`,
      choices: [
        {
          text: 'De secuencia, antes/después, con los milisegundos anotados.',
          correct: true,
          why: 'El título afirma una baja de latencia. El de secuencia con tiempos vuelve VERIFICABLE esa afirmación: se ve el paso de encadenadas a `par`, y la caché sacando una llamada del camino crítico.',
        },
        {
          text: 'De arquitectura, marcando los servicios y el nuevo caché.',
          correct: false,
          why: 'No se agregó ni movió ninguna pieza (la caché es en memoria, detalle interno). El de arquitectura no cambia entre antes y después.',
        },
        {
          text: 'De flujo, resaltando las decisiones del checkout.',
          correct: false,
          why: 'Las reglas de negocio no se tocaron. Un flujo idéntico antes y después no aporta nada al reviewer.',
        },
        {
          text: 'Ninguno: el diff y los benchmarks del PR alcanzan.',
          correct: false,
          why: 'El diff muestra el cambio de CÓDIGO. El diagrama muestra la afirmación del título (menos latencia) de forma verificable de un vistazo.',
        },
      ],
    },
    {
      id: 'b3-c1b',
      kind: 'multipleChoice',
      prompt: 'Si en cambio la caché fuera un REDIS compartido entre instancias (no en memoria del proceso), ¿cambia la respuesta?',
      choices: [
        {
          text: 'Sí: sumar uno de arquitectura al de secuencia.',
          correct: true,
          why: 'La caché deja de ser un detalle interno y pasa a ser un componente compartido: si Redis se cae, ¿qué le pasa al checkout? Esa pregunta es estructural y merece su propio diagrama.',
        },
        {
          text: 'No: alcanza con renombrar la caja de "cache" a "Redis" en el de secuencia.',
          correct: false,
          why: 'El diagrama de secuencia sigue mostrando la latencia, pero no sabe expresar "esto es un servicio compartido". Ese es un problema de arquitectura.',
        },
        {
          text: 'Sí: reemplazar el de secuencia por uno de arquitectura.',
          correct: false,
          why: 'Los dos son necesarios: el de arquitectura para el radio de impacto, el de secuencia para justificar la baja de latencia. No compiten.',
        },
        {
          text: 'Depende del tráfico: recién con miles de RPS suma un diagrama nuevo.',
          correct: false,
          why: 'El volumen NO cambia si es o no un diagrama distinto. Cambia si el sistema tiene una pieza compartida más — y con Redis lo tiene.',
        },
      ],
      takeaway: 'El diagrama de un PR tiene que volver verificable la afirmación del título. Cambia el título → cambia el diagrama.',
    },
    {
      id: 'b3-t1',
      kind: 'theory',
      title: 'Niveles de zoom (C4, sin la ceremonia)',
      body: 'El modelo C4 ordena los diagramas de arquitectura en cuatro niveles de zoom: contexto (tu sistema y quién lo usa), contenedores (los procesos desplegables: servicios, bases, colas), componentes (las piezas adentro de uno) y código. Su valor real no es la notación, es que te obliga a decidir en qué nivel estás. La mayoría de los diagramas malos mezclan dos niveles: un servicio al lado de una clase, o un usuario al lado de una tabla.',
      analogy:
        'El zoom de un mapa. En el mismo mapa no ponés países y números de puerta. Cada nivel de zoom tiene su escala de detalle, y mezclarlos te deja un mapa inútil en los dos niveles.',
    },
    {
      id: 'b3-tf1',
      kind: 'trueFalse',
      statement: 'Un diagrama que está en el README hay que mantenerlo actualizado, o borrarlo.',
      answer: true,
      why: 'Suena drástico y es la posición correcta: un diagrama desactualizado no es neutro. Tiene autoridad, y alguien va a decidir con él. Ahora, la conclusión práctica no es "mantengamos todo": es distinguir los diagramas que MERECEN mantenimiento (contexto y contenedores, que cambian por trimestre y rinden muchísimo) de los DESECHABLES por diseño — el que dibujaste en la pizarra para esa reunión, que se saca foto, se pega en el ticket y se muere ahí. Confundir los dos tipos es lo que llena los wikis de mentiras con formato.',
    },
    {
      id: 'b3-q3',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el trade-off principal de mantener diagramas versionados en el repo?',
      choices: [
        {
          text: 'Se desactualizan, y un diagrama desactualizado engaña. La mitigación no es "ser disciplinado": es dibujar sólo lo que cambia poco, o generarlo desde algo que ya mantenés.',
          correct: true,
          why: 'La disciplina no escala y nadie la sostiene bajo presión de entrega. Las dos mitigaciones que sí funcionan son estructurales: elegir el nivel de zoom correcto (los altos cambian lento) o derivar el diagrama de una fuente viva.',
        },
        {
          text: 'Cuestan tiempo de dibujar.',
          correct: false,
          why: 'El costo de dibujar es de una sola vez y es bajo — media hora. El costo real es el mantenimiento continuo, que se paga en cada cambio y para siempre.',
        },
        {
          text: 'Las herramientas de diagramación son caras o propietarias.',
          correct: false,
          why: 'Hoy tenés Mermaid, PlantUML o D2 en texto plano, versionados junto al código y renderizados por el propio GitHub. Dejó de ser un problema hace años.',
        },
        {
          text: 'Los diagramas en imágenes no se pueden revisar en un pull request.',
          correct: false,
          why: 'Es un problema real y es exactamente el argumento para usar diagrams-as-code. Pero es un síntoma del problema de mantenimiento, no la causa: un PNG desactualizado y un Mermaid desactualizado engañan igual.',
        },
      ],
      takeaway: 'Diagramas de alto nivel: mantenidos. Diagramas de detalle: generados o desechables.',
    },
    {
      id: 'b3-tf2',
      kind: 'trueFalse',
      statement:
        'Si un diagrama se puede generar automáticamente desde el código, siempre conviene generarlo en vez de dibujarlo.',
      answer: false,
      why: 'Un diagrama generado nunca se desactualiza, y eso es una ventaja enorme. Pero pierde exactamente lo que hace útil a un diagrama: el criterio de qué dejar afuera. Un grafo de dependencias autogenerado de un repo mediano es una bola de pelos ilegible — es perfectamente exacto y no comunica nada. La regla que funciona: GENERÁ lo que sirve como referencia (qué depende de qué, el esquema de una base, las rutas de una API) y DIBUJÁ a mano lo que sirve como argumento (por qué separamos esto, qué se rompe si se cae aquello). Referencia y argumento son usos distintos y quieren herramientas distintas.',
    },
    {
      id: 'b3-q4',
      kind: 'multipleChoice',
      prompt:
        'El mismo cambio se lo tenés que explicar a producto, a un dev que entró ayer, y al equipo de SRE. ¿Qué cambia entre las tres versiones?',
      choices: [
        {
          text: 'El tipo de diagrama y el nivel de zoom, porque cada audiencia tiene que tomar una decisión distinta.',
          correct: true,
          why: 'Producto decide sobre reglas (flujo), el dev nuevo necesita ubicarse (arquitectura, nivel contenedores), y SRE decide sobre modos de falla y alertas (arquitectura con dependencias y timeouts). Tres diagramas distintos del mismo cambio, y los tres correctos.',
        },
        {
          text: 'Sólo los nombres: términos técnicos para los devs y de negocio para producto.',
          correct: false,
          why: 'Renombrar las cajas sobre el mismo dibujo suele producir un diagrama que no le sirve del todo a ninguno. El problema no es el vocabulario: es qué dimensión del sistema le importa a cada uno.',
        },
        {
          text: 'Nada: un buen diagrama es autoexplicativo para cualquier audiencia.',
          correct: false,
          why: 'No existe. Un diagrama es autoexplicativo dentro de un contexto compartido, y ese contexto es justamente lo que no comparten producto y SRE.',
        },
        {
          text: 'Se hace uno solo con toda la información y cada uno mira la parte que le interesa.',
          correct: false,
          why: 'Es el diagrama de pared que nadie mira dos veces. "Cada uno mira lo suyo" suena eficiente y en la práctica significa que nadie encuentra lo suyo.',
        },
      ],
    },
    {
      id: 'b3-q5',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el trade-off que mejor resume la elección entre los tres tipos?',
      choices: [
        {
          text: 'Cada uno gana precisión en una dimensión —condiciones, tiempo o estructura— a costa de volverse ciego en las otras dos.',
          correct: true,
          why: 'Y esa ceguera es una FEATURE: es lo que los hace legibles de un vistazo. Un diagrama que intentara cubrir las tres dimensiones tendría la densidad del código y ninguna de sus ventajas.',
        },
        {
          text: 'Los más detallados son más útiles pero más caros de mantener.',
          correct: false,
          why: 'Mezcla dos ejes distintos. El detalle es una decisión dentro de cada tipo (podés hacer un diagrama de arquitectura muy detallado o muy grueso), no lo que distingue a los tres tipos entre sí.',
        },
        {
          text: 'El de secuencia es el más completo; los otros dos son simplificaciones.',
          correct: false,
          why: 'No hay uno "más completo". El de secuencia no puede expresar lógica condicional compleja ni estructura estable — es ciego en dos dimensiones, como los otros dos.',
        },
        {
          text: 'El de arquitectura es el más estable, así que ante la duda conviene ese.',
          correct: false,
          why: 'Estable no es lo mismo que adecuado. Para una discusión de latencia, un diagrama de arquitectura es inútil por más años que dure sin cambiar.',
        },
      ],
    },
    {
      id: 'b3-t2',
      kind: 'theory',
      title: 'Cuándo NO dibujar nada',
      body: 'Tres casos donde el diagrama es costo puro: cuando la interacción tiene dos participantes y tres pasos (una frase lo explica mejor y no se desactualiza), cuando el dibujo va a repetir literalmente lo que dice un archivo de código, y cuando lo estás dibujando para "documentar" sin una decisión concreta detrás. El diagrama es una herramienta de argumentación y de acuerdo: sin conversación, no tiene función.',
      analogy:
        'Un plano para colgar un cuadro. La técnica existe, es correcta, y no la vas a usar: agarrás el martillo.',
    },
    {
      id: 'b3-c2a',
      kind: 'multipleChoice',
      prompt: '¿Vale la pena dibujar un diagrama de secuencia de este módulo?',
      snippet: `
// src/notifications/index.ts
export async function notify(userId: string, event: DomainEvent) {
  const prefs = await prefsRepo.get(userId);
  const channels = pickChannels(prefs, event.severity);

  await Promise.allSettled(
    channels.map((c) => transports[c].send(userId, render(event, c))),
  );
}
`,
      choices: [
        {
          text: 'No: el diagrama diría lo mismo que el código.',
          correct: true,
          why: 'Regla práctica: si tu diagrama se puede reconstruir leyendo un solo archivo de arriba a abajo, no lo dibujes.',
        },
        {
          text: 'Sí: todo módulo público merece su diagrama de secuencia.',
          correct: false,
          why: 'El reflejo de "documentar = dibujar" produce diagramas que repiten el código. Documentar sirve cuando el diagrama muestra algo QUE EL CÓDIGO NO DICE BIEN.',
        },
        {
          text: 'Sí, para el README: un README sin diagrama pierde peso.',
          correct: false,
          why: '"Algo visual" no es una función. Un diagrama sin decisión detrás es adorno, y el adorno cuesta atención al lector.',
        },
        {
          text: 'Sí, para que producto lo entienda sin leer código.',
          correct: false,
          why: 'Producto no necesita saber que hay un `Promise.allSettled`. Le importan las REGLAS (qué canales se eligen), no el orden de llamadas técnicas.',
        },
      ],
    },
    {
      id: 'b3-c2b',
      kind: 'multipleChoice',
      prompt: 'Entonces, ¿qué SÍ vale la pena documentar de este módulo (con dibujo o sin él)?',
      snippet: `
const channels = pickChannels(prefs, event.severity);
// ↑ ¿qué canales se eligen según prefs y severidad?
`,
      choices: [
        {
          text: 'La regla de `pickChannels` y el porqué de `allSettled` sobre `all`.',
          correct: true,
          why: 'El código no dice bien las reglas distribuidas entre archivos ni las decisiones con alternativas descartadas. Flujo/tabla para reglas; ADR o dos párrafos para decisiones.',
        },
        {
          text: 'La estructura del módulo: archivos, imports, exports.',
          correct: false,
          why: 'Eso lo dice el código mejor. Un diagrama de estructura repite lo que un `tree` o el árbol del editor ya muestran.',
        },
        {
          text: 'La firma pública de `notify` y sus tipos de entrada.',
          correct: false,
          why: 'Los tipos ya la documentan. Un diagrama no aporta.',
        },
        {
          text: 'Nada: código claro se autoexplica sin doc adicional.',
          correct: false,
          why: '"Por qué allSettled" y "por qué estos canales para esta severidad" no salen del código. Son decisiones que se van a re-cuestionar y sin doc se re-discuten cada vez.',
        },
      ],
      takeaway: 'Doc de un módulo: NO dibujes lo que ya dice el código. SÍ dibujá las reglas distribuidas y escribí las decisiones con alternativas descartadas.',
    },
  ],
  summary: [
    'Antes de dibujar: quién lo lee, y qué decide después de leerlo. Sin decisión nombrable, no hace falta el diagrama.',
    'Cada tipo gana precisión en una dimensión y queda ciego en las otras dos. La ceguera es lo que lo hace legible.',
    'Postmortem → arquitectura (radio de impacto). RFC estructural → arquitectura antes/después. PR de performance → secuencia antes/después.',
    'El diagrama de un PR tiene que volver verificable la afirmación del título.',
    'C4 no vale por la notación: vale porque te obliga a elegir un nivel de zoom y no mezclarlo.',
    'Diagrama desactualizado ≠ neutro: tiene autoridad. Mantené los de alto nivel; tratá el resto como desechable.',
    'Generá lo que sirve de REFERENCIA; dibujá a mano lo que sirve de ARGUMENTO.',
    'Si tu diagrama se reconstruye leyendo un solo archivo, no lo dibujes.',
  ],
};
