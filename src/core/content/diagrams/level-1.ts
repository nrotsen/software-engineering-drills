import type { Level } from '../../domain/section.js';

export const level1: Level = {
  level: 1,
  title: 'Para qué sirve cada diagrama',
  goal: 'Al terminar vas a poder mirar un diagrama y decir qué pregunta responde — y darte cuenta cuando alguien usó el tipo equivocado.',
  items: [
    {
      id: 'b1-t0',
      kind: 'theory',
      title: 'Un diagrama es una respuesta, no un dibujo del sistema',
      body: 'El error de base es pensar que un diagrama documenta "el sistema". Ningún diagrama muestra el sistema: cada tipo responde UNA pregunta y esconde todo lo demás, y esconder es la mitad del trabajo. Antes de dibujar hay que decidir qué pregunta estás contestando, porque de eso sale el tipo de diagrama, y de ahí sale qué dejás afuera.',
      analogy:
        'Los mapas de una ciudad. El de subtes no tiene escala ni calles y es perfecto para viajar en subte; el catastral tiene cada parcela y es inútil para tomar el subte. Nadie pide "un mapa de Buenos Aires" a secas: pedís el mapa que responde tu pregunta.',
    },
    {
      id: 'b1-t1',
      kind: 'theory',
      title: 'Diagrama de flujo: ¿qué pasa en cada caso?',
      body: 'Un diagrama de flujo muestra la secuencia de PASOS y DECISIONES de un proceso: rectángulos para acciones, rombos para condiciones, flechas para el orden. Responde "¿qué camino sigue esto según las condiciones?". No muestra quién ejecuta cada paso ni cuánto tarda: si tu duda es "¿en qué casos rechazamos el pago?", este es el diagrama.',
      analogy:
        'La receta de un plato con notas al margen: "si la masa quedó seca, agregá agua". Te dice qué hacer y en qué orden según lo que pase, sin decir quién cocina ni en qué cocina.',
    },
    {
      id: 'b1-d1',
      kind: 'diagram',
      title: 'Flujo: alta de un pago',
      ascii: `
                    ┌───────────────┐
                    │ POST /payments│
                    └───────┬───────┘
                            ▼
                    ┌───────────────┐
                    │ validar input │
                    └───────┬───────┘
                            ▼
                        ╱───────╲
                       ╱ ¿monto  ╲   no    ┌──────────────┐
                      ╱  válido?  ╲───────▶│  400 inválido│
                      ╲           ╱        └──────────────┘
                       ╲_________╱
                            │ sí
                            ▼
                        ╱───────╲
                       ╱ ¿tarjeta╲   no    ┌──────────────┐
                      ╱ autoriza? ╲───────▶│ 402 rechazado│
                      ╲           ╱        │ + notificar  │
                       ╲_________╱         └──────────────┘
                            │ sí
                            ▼
                    ┌───────────────┐
                    │ guardar pago  │
                    │ estado=paid   │
                    └───────┬───────┘
                            ▼
                    ┌───────────────┐
                    │   201 creado  │
                    └───────────────┘
`,
      caption:
        'Lo que este diagrama contesta: en qué casos el pago termina en 400, en 402 o en 201. Lo que deliberadamente NO muestra: quién hace cada paso (¿el middleware? ¿el gateway?) ni cuánto tarda. Si tu pregunta fuera esa, este diagrama es el equivocado — y agregarle esa información lo arruinaría para su pregunta original.',
    },
    {
      id: 'b1-q1',
      kind: 'multipleChoice',
      prompt: '¿Cuándo un diagrama de flujo es la herramienta correcta?',
      choices: [
        {
          text: 'Cuando la complejidad está en las RAMAS: muchas condiciones, y hace falta acordar en qué casos pasa cada cosa.',
          correct: true,
          why: 'Es lo único que un flujo muestra bien. Discutir reglas de negocio con producto sobre un flujo funciona porque los rombos son exactamente las decisiones que hay que acordar.',
        },
        {
          text: 'Cuando querés documentar cómo está construido el sistema.',
          correct: false,
          why: 'Un flujo no dice nada de estructura: no muestra servicios, ni bases, ni despliegue. Para eso está el de arquitectura. Es el malentendido que produce esos flujos gigantes que nadie lee.',
        },
        {
          text: 'Cuando hay varios servicios hablando entre sí y querés ver el orden de las llamadas.',
          correct: false,
          why: 'Se puede forzar, pero el flujo no tiene el concepto de "quién": todo son cajas iguales. En cuanto hay dos o más participantes, el de secuencia comunica lo mismo con la mitad de tinta.',
        },
        {
          text: 'Siempre: es el más simple y lo entiende cualquiera.',
          correct: false,
          why: 'Que sea fácil de leer no lo hace correcto. Un flujo de 40 cajas describiendo una interacción entre servicios es más difícil de entender que un diagrama de secuencia de 8 flechas.',
        },
      ],
      takeaway: 'Flujo = la complejidad está en las DECISIONES.',
    },
    {
      id: 'b1-t2',
      kind: 'theory',
      title: 'Diagrama de secuencia: ¿quién le habla a quién, y en qué orden?',
      body: 'Un diagrama de secuencia pone un participante por columna (cliente, middleware, cada API, la base) y dibuja los mensajes entre ellos como flechas horizontales, de arriba hacia abajo en el tiempo. Responde "¿quién llama a quién, en qué orden, y qué espera a qué?". Es el único de los tres que tiene una noción real de TIEMPO, y por eso es el que sirve para hablar de latencia.',
      analogy:
        'La transcripción de una conversación telefónica a tres bandas, con las horas al costado. No te dice qué hace cada uno en su oficina; te dice quién habló, cuándo, y quién estuvo esperando en línea.',
    },
    {
      id: 'b1-q2',
      kind: 'multipleChoice',
      prompt:
        'Tu endpoint tarda 900ms y nadie sabe por qué. ¿Qué diagrama dibujás para la reunión?',
      choices: [
        {
          text: 'De secuencia, porque es el único que muestra el orden temporal de las llamadas y qué está esperando a qué.',
          correct: true,
          why: 'La latencia es un problema de tiempo y de dependencias entre llamadas. En un diagrama de secuencia se ve de un vistazo si dos requests salieron juntos o uno esperó al otro — que es exactamente la discusión de la Sección C.',
        },
        {
          text: 'De arquitectura, para mostrar todos los servicios que intervienen.',
          correct: false,
          why: 'Te dice QUÉ piezas hay pero no en qué orden se llaman ni cuáles se solapan. Sirve para la primera reunión de contexto; no para encontrar los 400ms.',
        },
        {
          text: 'De flujo, con un rombo por cada validación que hace el endpoint.',
          correct: false,
          why: 'Muestra las ramas del proceso, no el tiempo. Podés tener un flujo de dos cajas y aun así 900ms de latencia, porque el problema está en cómo se ordenaron las llamadas de red.',
        },
        {
          text: 'Ninguno: para latencia hace falta un profiler o un trace, no un diagrama.',
          correct: false,
          why: 'El trace te da los números, y es imprescindible. Pero el diagrama es lo que te deja DISCUTIR el rediseño con el equipo: "estas dos no dependen entre sí, van en paralelo". Los datos y el modelo resuelven cosas distintas.',
        },
      ],
      takeaway: 'Secuencia = la complejidad está en el ORDEN y en quién espera a quién.',
    },
    {
      id: 'b1-t3',
      kind: 'theory',
      title: 'Diagrama de arquitectura: ¿de qué piezas está hecho?',
      body: 'Un diagrama de arquitectura (o de componentes) muestra las PIEZAS del sistema y sus relaciones estables: servicios, bases, colas, clientes, y quién depende de quién. No tiene tiempo ni condiciones: es una foto de la estructura, no de una ejecución. Responde "¿qué existe, dónde vive el dato, y qué se rompe si esta caja se cae?".',
      analogy:
        'El plano de las cañerías de un edificio. No te dice a qué hora se ducha cada uno; te dice qué caños hay, adónde van, y qué pisos se quedan sin agua si cortás este.',
    },
    {
      id: 'b1-d2',
      kind: 'diagram',
      title: 'Arquitectura: qué piezas hay y quién depende de quién',
      ascii: `
   ┌──────────┐        ┌──────────────────┐
   │  Web SPA │───────▶│                  │
   └──────────┘        │   API Gateway    │
   ┌──────────┐        │  (auth, rate     │
   │  Mobile  │───────▶│   limit, routing)│
   └──────────┘        └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │ Orders Service│ │ Users Service │ │Payments Service│
      └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
              │                 │                 │
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │ Postgres      │ │ Postgres      │ │  Stripe API   │
      │ (orders)      │ │ (users)       │ │  (externo)    │
      └───────┬───────┘ └───────────────┘ └───────────────┘
              │
              ▼
      ┌───────────────┐        ┌───────────────┐
      │  Cola (SQS)   │───────▶│  Worker de    │
      │  order.placed │        │  facturación  │
      └───────────────┘        └───────────────┘
`,
      caption:
        'Contesta tres preguntas de un vistazo: qué piezas existen, dónde vive cada dato (cada servicio con su base: nadie lee la base del otro), y qué se cae si se cae una caja. Fijate lo que NO dice: en qué orden ocurre nada, ni qué pasa si Stripe rechaza. Para eso hacen falta los otros dos diagramas — y está bien que así sea.',
    },
    {
      id: 'b1-q3',
      kind: 'multipleChoice',
      prompt:
        'Entra alguien nuevo al equipo. ¿Con qué diagrama arrancás para que entienda el sistema?',
      choices: [
        {
          text: 'Arquitectura, porque necesita el mapa de piezas antes de poder ubicar cualquier detalle.',
          correct: true,
          why: 'Sin el mapa, un diagrama de secuencia es una lista de nombres que no significan nada. Primero "qué existe", después "cómo se hablan", y al final "qué pasa en cada caso".',
        },
        {
          text: 'De secuencia del endpoint más importante, porque muestra el sistema funcionando de verdad.',
          correct: false,
          why: 'Es un excelente SEGUNDO diagrama. Como primero falla porque asume que el lector ya sabe qué es cada columna: le estás mostrando la conversación antes de presentarle a los participantes.',
        },
        {
          text: 'De flujo del proceso de negocio principal, porque el negocio es lo que importa.',
          correct: false,
          why: 'El negocio importa, pero un flujo no tiene participantes: alguien nuevo no puede mapear las cajas contra el repositorio que acaba de clonar. Es un gran tercer diagrama.',
        },
        {
          text: 'El diagrama de la base de datos, porque el esquema es la verdad del sistema.',
          correct: false,
          why: 'Un ERD dice cómo se guarda el dato, no cómo funciona el sistema. Y en una arquitectura de varios servicios, mirar un solo esquema da una idea directamente equivocada del alcance.',
        },
      ],
      takeaway: 'Arquitectura = la complejidad está en las PIEZAS y sus dependencias.',
    },
    {
      id: 'b1-tf1',
      kind: 'trueFalse',
      statement: 'Un buen diagrama debería incluir toda la información relevante del sistema.',
      answer: false,
      why: 'Al revés: el valor de un diagrama está en lo que DEJA AFUERA. Un diagrama que muestra todo tiene la misma densidad de información que el código, con la desventaja de que además se desactualiza. La prueba práctica: si necesitás una leyenda de diez símbolos, o si no entra en una pantalla sin hacer zoom, ya perdió. La versión senior de esta idea: un diagrama es un argumento, y un argumento con veinte premisas no convence a nadie.',
    },
    {
      id: 'b1-tf2',
      kind: 'trueFalse',
      statement:
        'Los tres tipos —flujo, secuencia y arquitectura— muestran lo mismo con distinta notación.',
      answer: false,
      why: 'Muestran DIMENSIONES distintas y son complementarios, no intercambiables. El de flujo tiene condiciones pero no participantes; el de secuencia tiene participantes y tiempo pero no condiciones (o muy pocas, con fragmentos alt); el de arquitectura tiene piezas y dependencias pero ni tiempo ni condiciones. Por eso un sistema real suele necesitar los tres, respondiendo tres preguntas distintas — y por eso también intentar meter las tres dimensiones en un solo dibujo produce esos diagramas de pared que nadie mira dos veces.',
    },
    {
      id: 'b1-q4',
      kind: 'multipleChoice',
      prompt:
        'Producto pregunta: "¿qué pasa si el usuario ya tiene una suscripción activa y compra otra?". ¿Qué dibujás?',
      choices: [
        {
          text: 'Un diagrama de flujo: la pregunta es sobre casos y condiciones, que es exactamente lo que un flujo muestra.',
          correct: true,
          why: 'La pregunta tiene la forma "si pasa X, ¿qué pasa?". Eso es un rombo. Además producto puede leerlo y corregirte sin saber nada de servicios, que es medio punto del ejercicio.',
        },
        {
          text: 'Un diagrama de secuencia mostrando la llamada al servicio de suscripciones.',
          correct: false,
          why: 'Responde "cómo lo implementamos", no "qué decidimos". Producto no necesita saber que hay un servicio de suscripciones para opinar sobre la regla de negocio.',
        },
        {
          text: 'Un diagrama de estados de la suscripción.',
          correct: false,
          why: 'Es una respuesta defendible y a veces la mejor —si la pregunta real es sobre el ciclo de vida (activa, vencida, en gracia, cancelada)—. Pero la pregunta acá es sobre una decisión puntual, y un flujo la contesta más directo.',
        },
        {
          text: 'Ninguno: se contesta con una tabla de casos en el ticket.',
          correct: false,
          why: 'Una tabla de casos es perfectamente válida y a veces mejor que un dibujo. Pero con tres o más condiciones encadenadas, la tabla explota combinatoriamente y el flujo muestra el camino de un vistazo.',
        },
      ],
    },
    {
      id: 'b1-c1a',
      kind: 'multipleChoice',
      prompt: 'Si en el code review de este handler el tema es PERFORMANCE, ¿qué diagrama dibujás?',
      snippet: `
async function handler(req, res) {
  const user = await auth.verify(req.headers.authorization);

  const [profile, subscription] = await Promise.all([
    users.findById(user.id),
    billing.getSubscription(user.id),
  ]);

  if (!subscription || subscription.status === 'expired') {
    return res.status(402).json({ error: 'subscription_required' });
  }

  const orders = await orders.listFor(user.id, { limit: 20 });
  return res.json({ profile, subscription, orders });
}
`,
      choices: [
        {
          text: 'De secuencia, con los milisegundos escritos en cada flecha.',
          correct: true,
          why: 'Latencia = orden temporal + dependencias entre llamadas. Es el único diagrama que muestra tiempo y qué espera a qué.',
        },
        {
          text: 'De arquitectura, mostrando los servicios y sus dependencias.',
          correct: false,
          why: 'Te dice QUÉ piezas hay, no CUÁNDO se llaman. Con ese diagrama no descubrís que `orders` está esperando de más.',
        },
        {
          text: 'De flujo, con un rombo por cada validación del handler.',
          correct: false,
          why: 'Muestra las ramas del proceso, no el tiempo. Podrías tener un flujo de dos cajas y 900ms de latencia igual.',
        },
        {
          text: 'Un flame graph exportado del profiler para la reunión.',
          correct: false,
          why: 'El profiler te da NÚMEROS. El diagrama te deja DISCUTIR el rediseño con el equipo. Son cosas distintas y complementarias.',
        },
      ],
    },
    {
      id: 'b1-c1b',
      kind: 'multipleChoice',
      prompt: 'Si en cambio la discusión con producto es sobre LAS REGLAS del handler (cuándo devolvés 402), ¿qué diagrama dibujás?',
      snippet: `
if (!subscription || subscription.status === 'expired') {
  return res.status(402).json({ error: 'subscription_required' });
}
`,
      choices: [
        {
          text: 'De flujo, con un rombo por cada condición del handler.',
          correct: true,
          why: 'Flujo = rombos de decisión. Producto opina de reglas de negocio sin necesitar saber qué servicios existen.',
        },
        {
          text: 'De secuencia, resaltando la llamada a `billing.getSubscription`.',
          correct: false,
          why: 'Responde "cómo lo implementamos", no "qué decidimos". Producto no debería depender de saber qué es billing para opinar de la regla.',
        },
        {
          text: 'De arquitectura, marcando el servicio de suscripciones.',
          correct: false,
          why: 'La discusión no es sobre piezas: es sobre condiciones. Un diagrama de arquitectura no tiene rombos.',
        },
        {
          text: 'Una tabla de decisión, exhaustiva sobre las combinaciones.',
          correct: false,
          why: 'Es defendible con una regla simple, pero con tres o más condiciones encadenadas la tabla explota combinatoriamente. El flujo las muestra de un vistazo.',
        },
      ],
    },
    {
      id: 'b1-c1c',
      kind: 'multipleChoice',
      prompt: 'Y si entra alguien NUEVO al equipo y le tenés que explicar este handler, ¿por cuál empezás?',
      choices: [
        {
          text: 'De arquitectura: el mapa de servicios y sus dependencias.',
          correct: true,
          why: 'Onboarding = primero "qué existe", después "cómo se hablan", al final "qué pasa en cada caso". Arquitectura → secuencia → flujo.',
        },
        {
          text: 'De secuencia del endpoint más representativo del sistema.',
          correct: false,
          why: 'Excelente SEGUNDO diagrama. Como primero falla porque asume que el lector ya sabe qué es cada columna.',
        },
        {
          text: 'De flujo del proceso de negocio principal.',
          correct: false,
          why: 'Un flujo no tiene participantes. Alguien nuevo no puede mapear las cajas contra el repositorio recién clonado.',
        },
        {
          text: 'Un ERD del esquema, para anclar el dominio en datos concretos.',
          correct: false,
          why: 'Un ERD dice cómo se guarda el dato, no cómo funciona el sistema. Y con varios servicios, un solo esquema da una idea equivocada del alcance.',
        },
      ],
      takeaway: 'La pregunta "¿qué diagrama hago?" no se contesta mirando el código: se contesta mirando la CONVERSACIÓN que querés tener.',
    },
  ],
  summary: [
    'Un diagrama responde UNA pregunta. Lo que deja afuera es la mitad del trabajo.',
    'Flujo: la complejidad está en las DECISIONES. Rombos = las reglas que hay que acordar con producto.',
    'Secuencia: la complejidad está en el ORDEN. Es el único de los tres que tiene noción de tiempo.',
    'Arquitectura: la complejidad está en las PIEZAS. Contesta qué existe, dónde vive el dato y qué se cae.',
    'Para alguien nuevo: arquitectura → secuencia → flujo. Sin el mapa, la conversación no significa nada.',
    'Un diagrama que muestra todo tiene la densidad del código y encima se desactualiza.',
    'No se elige el diagrama mirando el código: se elige mirando la conversación que querés tener.',
  ],
};
