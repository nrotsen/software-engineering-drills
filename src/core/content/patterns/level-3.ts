import type { Level } from '../../domain/section.js';

export const level3: Level = {
  level: 3,
  title: 'Cuándo NO, y cómo justificarlo',
  goal: 'Al terminar vas a poder defender —o rechazar— la introducción de un patrón en un code review con un argumento que incluya el costo.',
  items: [
    {
      id: 'd3-t0',
      kind: 'theory',
      title: 'Un patrón es una apuesta',
      body: 'Aplicar un patrón es apostar a que cierto eje va a cambiar. Si acertás, agregar el caso número cinco cuesta un archivo. Si errás, pagaste indirección para siempre y no cobraste nunca. Por eso la pregunta nunca es "¿qué patrón uso acá?" sino "¿qué cambio espero, con qué frecuencia, y cuánto me cuesta hoy prepararme para él?".',
      analogy:
        'Un seguro. Tiene sentido según la probabilidad del siniestro y el costo de la prima. Nadie contrata todos los seguros disponibles porque sí, y nadie los contrata sin mirar el precio.',
    },
    {
      id: 'd3-q1',
      kind: 'multipleChoice',
      prompt: '¿Cuál de estos es el PEOR uso de un Singleton en un backend Node?',
      choices: [
        {
          text: 'Guardar el estado de la request (usuario actual, tenant) en una instancia única del proceso.',
          correct: true,
          why: 'Es un bug de correctitud y de seguridad, no de estilo. El event loop intercala requests, así que el request B puede leer lo que dejó el A entre dos await. Es la forma más rápida de filtrar datos entre clientes. Para esto existe AsyncLocalStorage, o directamente pasar el contexto explícito.',
        },
        {
          text: 'Un pool de conexiones a la base de datos.',
          correct: false,
          why: 'Es el uso CORRECTO y canónico: el pool tiene que ser uno solo por proceso. Crear uno por request agota los slots de la base en el primer pico de tráfico.',
        },
        {
          text: 'Un cliente HTTP configurado con reintentos y timeouts.',
          correct: false,
          why: 'También correcto y por la misma razón: querés reusar las conexiones keep-alive. Es infraestructura compartida sin ningún estado que dependa de quién pide.',
        },
        {
          text: 'Un caché en memoria con TTL.',
          correct: false,
          why: 'Es defendible, y compartirlo es justamente el punto. Tiene riesgos propios (memoria que crece sin techo, datos de un tenant visibles para otro si la clave está mal armada), pero el patrón no está mal elegido: un caché por request no cachea nada.',
        },
      ],
      takeaway:
        'Un Singleton puede tener configuración e infraestructura. Nunca estado que dependa de quién está pidiendo.',
    },
    {
      id: 'd3-c1a',
      kind: 'multipleChoice',
      prompt: '¿Qué falla en este uso del Singleton?',
      snippet: `
class RequestContext {
  private static instance = new RequestContext();
  static get() { return RequestContext.instance; }
  userId?: string;
  tenantId?: string;
}

// middleware:  RequestContext.get().tenantId = token.tenant;
// más abajo:   const rows = await db.query('... tenant = $1', [RequestContext.get().tenantId]);
`,
      choices: [
        {
          text: 'Dos requests concurrentes se pisan `tenantId` entre `await`s.',
          correct: true,
          why: 'El event loop intercala requests: A escribe su tenant, cede el control en un `await`, B sobrescribe, y cuando A vuelve consulta con el tenant de B.',
        },
        {
          text: 'El constructor no es `private`: pueden nacer más instancias sueltas.',
          correct: false,
          why: 'Aunque lo fuera, el problema seguiría: la instancia única es el problema, no las múltiples.',
        },
        {
          text: 'Los campos opcionales (`?`) permiten lecturas de `undefined`.',
          correct: false,
          why: 'Es una molestia menor de tipos, pero no explica el pisado entre requests. El bug ocurre igual con campos requeridos.',
        },
        {
          text: 'La lectura y la escritura a `tenantId` no son atómicas.',
          correct: false,
          why: 'Sí lo son: JS es monohilo y una asignación no se interrumpe a mitad de camino. El problema es el ENTRELAZADO entre requests, no la atomicidad de una operación.',
        },
      ],
    },
    {
      id: 'd3-c1b',
      kind: 'multipleChoice',
      prompt: '¿Cómo lo arreglás?',
      choices: [
        {
          text: '`AsyncLocalStorage` o pasar el contexto explícito por parámetro.',
          correct: true,
          why: '`AsyncLocalStorage` existe exactamente para esto: da un "storage" que sobrevive los `await` sin cruzarse entre requests. Contexto explícito es más verboso pero imposible de romper.',
        },
        {
          text: 'Serializar los accesos con un `Mutex` alrededor del contexto.',
          correct: false,
          why: 'JS es monohilo. No hay carrera de escritura; hay ENTRELAZADO entre requests. Un mutex no arregla el entrelazado.',
        },
        {
          text: 'Reinstanciar el contexto en cada llamada a `get()`.',
          correct: false,
          why: 'Rompe el propósito: cada llamada pierde lo que la anterior escribió. Necesitás UNA instancia POR REQUEST, no una por llamada.',
        },
        {
          text: 'Limpiar el contexto al final del middleware con `finally`.',
          correct: false,
          why: 'No arregla el entrelazado: entre que se escribe y se limpia hay awaits donde otras requests entran a leer.',
        },
      ],
    },
    {
      id: 'd3-c1c',
      kind: 'multipleChoice',
      prompt: '¿Por qué este bug es PEOR que un bug normal?',
      choices: [
        {
          text: 'Invisible en dev, intermitente en prod, e impacta la seguridad.',
          correct: true,
          why: 'Es la peor combinación posible: invisible en dev, no reproducible en prod, y con impacto grave cuando pasa. Y sin un `await` entre escritura y lectura el código "funciona" — hasta que alguien mete una llamada async en el medio.',
        },
        {
          text: 'Tumba el proceso Node y hay que reiniciar el servidor.',
          correct: false,
          why: 'No se cae: devuelve datos incorrectos silenciosamente. Es peor que caerse — una caída se detecta y se alerta.',
        },
        {
          text: 'No se registra en logs porque no lanza excepciones.',
          correct: false,
          why: 'Está cerca de una razón real (no hay excepción para loguear), pero no es lo que lo hace PEOR: lo grave no es la observabilidad, es el impacto de seguridad y la intermitencia.',
        },
        {
          text: 'Degrada la latencia p99 cuando la contención se acumula.',
          correct: false,
          why: 'JS es monohilo: no hay contención en el sentido clásico. El impacto es de CORRECTITUD y SEGURIDAD, no de latencia.',
        },
      ],
      takeaway: 'Regla: un Singleton puede tener configuración e infraestructura, NUNCA estado que dependa de quién está pidiendo.',
    },
    {
      id: 'd3-q2',
      kind: 'multipleChoice',
      prompt:
        'Tenés un solo tipo de exportador (CSV) y no hay otros planeados. ¿Vale la pena escribir una createExporter()?',
      choices: [
        {
          text: 'No: hoy es indirección sin beneficio. Cuando aparezca el segundo formato, extraer la factory es un refactor de diez minutos con el compilador de tu lado.',
          correct: true,
          why: 'El costo del patrón se paga desde el primer día y todos los días; el beneficio llega recién con el segundo caso. Y extraer una abstracción a partir de dos casos CONCRETOS sale mejor que inventarla a partir de uno imaginado.',
        },
        {
          text: 'Sí: siempre conviene dejarlo preparado para el futuro.',
          correct: false,
          why: 'Es la definición de sobreingeniería preventiva. Peor todavía: la abstracción que inventás sin un segundo caso real suele estar mal dimensionada, y desarmarla cuesta más que no haberla escrito.',
        },
        {
          text: 'Sí, porque con una factory es más fácil testear.',
          correct: false,
          why: 'Si el problema es el test, la solución es inyectar la dependencia, no agregar una capa de creación. Son dos cosas distintas y confundirlas lleva a factories que existen sólo para los tests.',
        },
        {
          text: 'No, y tampoco cuando aparezca el segundo: con dos casos un if alcanza.',
          correct: false,
          why: 'Es defendible con dos casos, pero no como regla. La factory empieza a rendir cuando la decisión de selección se repite en varios lugares o depende de config o entorno — y eso puede pasar perfectamente con dos.',
        },
      ],
    },
    {
      id: 'd3-q3',
      kind: 'multipleChoice',
      prompt: '¿En cuál de estos casos NO pondrías un Repository?',
      choices: [
        {
          text: 'En un script de migración que corre una sola vez y hace tres queries.',
          correct: true,
          why: 'El repositorio existe para desacoplar el dominio de la persistencia A LO LARGO DEL TIEMPO. Un script que se ejecuta una vez y se borra no tiene ese tiempo: la abstracción es costo puro, y encima esconde el SQL que en una migración querés leer literal.',
        },
        {
          text: 'En un servicio de dominio que hoy usa Postgres pero que podría tener que leer de una API.',
          correct: false,
          why: 'Es el caso canónico A FAVOR: el eje de cambio está identificado y es exactamente el que el patrón cubre.',
        },
        {
          text: 'En un módulo cuyos tests hoy necesitan levantar una base con Docker.',
          correct: false,
          why: 'También a favor, y con el beneficio más medible de todos: una implementación en memoria baja esa suite de minutos a milisegundos, y eso cambia cómo trabaja el equipo todos los días.',
        },
        {
          text: 'En una capa que hoy tiene SQL crudo desparramado por los handlers HTTP.',
          correct: false,
          why: 'A favor, y es el olor más claro que existe: el dominio hablando SQL en la capa de transporte. Ahí el repositorio ordena dos cosas a la vez.',
        },
      ],
    },
    {
      id: 'd3-tf1',
      kind: 'trueFalse',
      statement: 'Usar patrones de diseño hace que el código sea más mantenible.',
      answer: false,
      why: 'Usar el patrón CORRECTO para un problema que efectivamente tenés lo hace más mantenible. Usarlos porque sí lo hace menos: cada patrón agrega indirección, y la indirección tiene un costo fijo de lectura que paga cada persona que abre el archivo, para siempre. El código más difícil de mantener que vas a encontrar no es el que no tiene ningún patrón: es el que tiene cinco donde hacían falta cero, porque además cada uno viene con la promesa implícita de una flexibilidad que nadie usa y que igual hay que sostener y testear.',
    },
    {
      id: 'd3-t1',
      kind: 'theory',
      title: 'La fórmula de tres partes',
      body: 'Una justificación completa se dice en una oración y tiene tres partes: el NOMBRE del patrón, el EJE de cambio que estás cubriendo, y qué GANÁS y qué RESIGNÁS. Si te falta la tercera, lo que estás haciendo es citar autoridad: quien revisa no puede evaluar la decisión, sólo aceptarla o pelearse. Y si te falta la segunda, ni siquiera vos sabés por qué lo estás haciendo.',
      analogy:
        'Un diagnóstico médico completo: qué tenés, por qué ese tratamiento, y cuáles son los efectos secundarios. Sin la tercera parte no podés decidir nada — sólo obedecer.',
    },
    {
      id: 'd3-q4',
      kind: 'multipleChoice',
      prompt:
        'En un code review, ¿cuál de estos comentarios justifica mejor la introducción de un Strategy?',
      choices: [
        {
          text: '"Strategy: los métodos de pago se agregan unas 3 veces por año y hoy cada uno toca 4 switches distintos. Gano que agregar uno sea un archivo nuevo; resigno que el flujo completo ya no se lea en un solo lugar."',
          correct: true,
          why: 'Las tres partes: nombre, eje de cambio con frecuencia real, y el costo dicho en voz alta. El que revisa puede estar en desacuerdo con la estimación, que es exactamente la discusión que vale la pena tener.',
        },
        {
          text: '"Acá corresponde Strategy, es el patrón estándar para este tipo de problema."',
          correct: false,
          why: 'Cita autoridad y no da nada para evaluar. La repregunta obvia —"¿por qué acá y no en los otros diez switches del repo?"— se queda sin respuesta.',
        },
        {
          text: '"Con Strategy queda más limpio y desacoplado que con el switch."',
          correct: false,
          why: '"Limpio" y "desacoplado", sin decir de qué te desacoplás y para qué, son las dos palabras más vacías de un code review. Se pueden usar para defender cualquier cosa, y por eso no defienden nada.',
        },
        {
          text: '"Strategy: así podemos agregar cualquier método de pago en el futuro sin tocar nada."',
          correct: false,
          why: 'Nombra el beneficio pero exagera —"sin tocar nada" es falso: hay que registrarlo en algún lado, y probablemente tocar la config y los tipos— y omite el costo. Prometer de más es lo que hace que la próxima vez no te crean.',
        },
      ],
      takeaway: 'Nombre + eje de cambio + qué gano y qué resigno. Las tres partes, en una oración.',
    },
    {
      id: 'd3-c2a',
      kind: 'multipleChoice',
      prompt: '¿Está bien aplicado el patrón Strategy en este código?',
      snippet: `
interface DiscountStrategy {
  apply(total: number): number;
}

class NoDiscountStrategy implements DiscountStrategy {
  apply(total: number) { return total; }
}

class TenPercentStrategy implements DiscountStrategy {
  apply(total: number) { return total * 0.9; }
}

class DiscountStrategyFactory {
  static for(user: User): DiscountStrategy {
    return user.isPremium ? new TenPercentStrategy() : new NoDiscountStrategy();
  }
}
`,
      choices: [
        {
          text: 'No: cuatro archivos para expresar un ternario.',
          correct: true,
          why: 'Cuatro archivos para seguir una multiplicación. Sobreingeniería: hay indirección sin beneficio porque no hay eje de variación real.',
        },
        {
          text: 'Sí: cumple OCP porque agregar descuentos no toca lo existente.',
          correct: false,
          why: 'OCP se aplica sobre el eje por el que ya sabés que el sistema crece. Acá no hay tal eje: son dos casos y uno no hace nada. Cumplir un principio sobre un eje inexistente es la definición de sobreingeniería.',
        },
        {
          text: 'Sí, pero falta un `DiscountStrategyRegistry` que las agrupe.',
          correct: false,
          why: 'Suma más ceremonia sobre una estructura que ya sobra. Un Registry sobre dos entradas (una nula) no rinde.',
        },
        {
          text: 'Casi: falta que `Factory.for` cachee la instancia devuelta.',
          correct: false,
          why: 'Cachear estrategias sin estado es un detalle ínfimo que no cambia el problema de fondo: el patrón entero no se justifica.',
        },
      ],
    },
    {
      id: 'd3-c2b',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el OLOR específico que delata que este Strategy está forzado?',
      choices: [
        {
          text: 'Una de las estrategias es la NULA (no hace nada).',
          correct: true,
          why: 'Si el eje de variación tiene dos valores y uno es "no hacer nada", es un `if`, no una familia de algoritmos.',
        },
        {
          text: 'La factory decide con un ternario en vez de un mapa.',
          correct: false,
          why: 'La factory que acompaña a un Strategy es normal y correcta cuando hay un Strategy real. Acá el problema NO es cómo elige la factory, es que no hay estrategias que valga la pena elegir entre sí.',
        },
        {
          text: 'La interfaz `DiscountStrategy` tiene un único método.',
          correct: false,
          why: 'Interfaces de un solo método son perfectas para Strategy — es el ISP aplicado. No es el olor.',
        },
        {
          text: 'Las clases terminan en `Strategy` en lugar de `Discount`.',
          correct: false,
          why: 'El sufijo es una convención razonable cuando el patrón se justifica. El olor está en la estructura, no en el nombre.',
        },
      ],
    },
    {
      id: 'd3-c2c',
      kind: 'multipleChoice',
      prompt: '¿Cuándo SÍ se justificaría un Strategy para los descuentos?',
      choices: [
        {
          text: 'Cuando marketing cargue reglas dinámicas que puedan COMBINARSE.',
          correct: true,
          why: 'Ahí un ternario deja de alcanzar y la ceremonia se vuelve estructura. Hay un eje de variación real con dueño, frecuencia y combinaciones.',
        },
        {
          text: 'Cuando el equipo lo pida en el code review para uniformar el estilo.',
          correct: false,
          why: 'La demanda social no crea el problema técnico. El patrón se justifica por el eje de cambio, no por presión de par.',
        },
        {
          text: 'Cuando haya más de 3 descuentos, no importa la forma.',
          correct: false,
          why: 'El número de casos ayuda a ver el eje, pero no lo crea. Tres if idénticos con multiplicaciones distintas no piden Strategy: piden una tabla.',
        },
        {
          text: 'Cuando la performance del `if` sea un cuello de botella.',
          correct: false,
          why: 'Un `if` no es un cuello de botella. Y si lo fuera, un `switch` o una tabla se resolverían más rápido que un dispatch por polimorfismo.',
        },
      ],
      takeaway: 'Justificación completa = nombre + eje de cambio + qué gano y qué resigno. Sin las tres partes, es citar autoridad.',
    },
    {
      id: 'd3-q5',
      kind: 'multipleChoice',
      prompt: '¿Cuál es el costo principal de resolver algo con Observer?',
      choices: [
        {
          text: 'El flujo deja de ser visible: leyendo el emisor no sabés qué pasa después, y el orden de los suscriptores es implícito.',
          correct: true,
          why: 'Cambiás acoplamiento por trazabilidad. En un sistema con muchos eventos, responder "¿qué pasa cuando se crea un pedido?" pasa a requerir un grep, y el orden en que corren los listeners depende de en qué orden se registraron — que suele depender del orden de los imports.',
        },
        {
          text: 'Es más lento que llamar la función directamente.',
          correct: false,
          why: 'El overhead de un EventEmitter es despreciable frente a cualquier operación de I/O. El problema es de legibilidad y de debugging, no de performance.',
        },
        {
          text: 'No se puede combinar con async/await.',
          correct: false,
          why: 'Sí se puede. Hay un detalle real a cuidar —un throw sin catch en un listener async se convierte en unhandledRejection y puede tumbar el proceso— pero es manejable, no un impedimento.',
        },
        {
          text: 'Obliga a sumar una librería de eventos.',
          correct: false,
          why: 'Node trae EventEmitter en el core y el browser tiene EventTarget. No hay ninguna dependencia nueva.',
        },
      ],
      takeaway: 'Si nadie más va a escuchar nunca, una llamada directa se lee mejor y se debuggea mejor.',
    },
    {
      id: 'd3-c3a',
      kind: 'multipleChoice',
      prompt: 'Van a agregar WhatsApp y Slack. ¿Cuál es el PRIMER patrón que aplicás y por qué?',
      snippet: `
async function notifyUser(user: User, event: DomainEvent) {
  if (user.prefs.email) {
    await sendgrid.send(user.email, render(event, 'email'));
  }
  if (user.prefs.sms) {
    await twilio.messages.create({ to: user.phone, body: render(event, 'sms') });
  }
  if (user.prefs.push && user.deviceToken) {
    await firebase.send(user.deviceToken, render(event, 'push'));
  }
}
`,
      choices: [
        {
          text: 'Adapter: normalizar cada SDK a un `Notifier { send(to, msg) }`.',
          correct: true,
          why: 'Cada SDK tiene forma propia y por eso hay tres `if` distintos. El Adapter elimina esa incompatibilidad — vale la pena aunque no vinieran más canales.',
        },
        {
          text: 'Strategy: una `NotifierStrategy` que se elige según `user.prefs`.',
          correct: false,
          why: 'Es el patrón que va DESPUÉS, para la selección de canales. Aplicarlo primero, sin normalizar la interfaz, cablea tres firmas distintas en tres subclases.',
        },
        {
          text: 'Observer: cada canal se suscribe al `DomainEvent`.',
          correct: false,
          why: 'Observer resuelve otra cosa (desacople emisor/consumidor) y esconde el flujo. Acá el problema es que las APIs son incompatibles, no que haya demasiado acoplamiento.',
        },
        {
          text: 'Factory: un `NotifierFactory.for(channel)` que devuelve el SDK.',
          correct: false,
          why: 'Factory sin Adapter debajo sigue devolviendo tres cosas con firmas distintas. La factory elige el objeto; sigue faltando que ese objeto tenga la misma forma.',
        },
      ],
    },
    {
      id: 'd3-c3b',
      kind: 'multipleChoice',
      prompt: 'Con el Adapter ya aplicado, ¿qué SEGUNDO patrón agregás para las preferencias del usuario?',
      choices: [
        {
          text: 'Registry de canales, iterado según `user.prefs`.',
          correct: true,
          why: 'No construís UN canal (Factory), ELEGÍS CUÁLES correr. El eje de cambio (canales que se agregan) queda cubierto.',
        },
        {
          text: 'Chain of Responsibility con los canales encadenados por prioridad.',
          correct: false,
          why: 'Chain se usa cuando UN handler atiende y los demás pasan. Acá querés que TODOS los canales elegidos corran; no hay cadena.',
        },
        {
          text: 'Observer con un tópico por canal y suscripción por `prefs`.',
          correct: false,
          why: 'Ganás desacople pero perdés control (¿qué canales corrieron? ¿en qué orden?). Y esconde el flujo justo cuando querés inspeccionarlo.',
        },
        {
          text: 'Un `NotifierFactory.for(prefs)` que arme el Notifier correcto.',
          correct: false,
          why: 'Factory construye UNO; acá necesitás CORRER VARIOS. Sirve para elegir un canal por vez, no para orquestar N.',
        },
      ],
    },
    {
      id: 'd3-c3c',
      kind: 'multipleChoice',
      prompt: 'Este refactor destapa un BUG de concurrencia escondido en el original. ¿Cuál es?',
      snippet: `
// original: 3 awaits secuenciales
if (user.prefs.email) { await sendgrid.send(...); }
if (user.prefs.sms)   { await twilio.messages.create(...); }
if (user.prefs.push)  { await firebase.send(...); }
`,
      choices: [
        {
          text: 'Waterfall: se suman las latencias y un fallo aborta los otros canales.',
          correct: true,
          why: 'Waterfall + fail-fast: dos problemas de concurrencia por el precio de uno. `allSettled` los envía en paralelo y aísla los fallos por canal.',
        },
        {
          text: 'Cada `await` cede al event loop y otro request puede pisar `user.prefs`.',
          correct: false,
          why: '`user.prefs` es una referencia local al parámetro, no un objeto global compartido. Ningún otro request puede pisarla — el problema real es latencia y arrastre de fallos.',
        },
        {
          text: '`render` corre en el hilo principal y bloquea entre `await`s.',
          correct: false,
          why: 'Render de un template no bloquea nada significativo. Y aunque bloqueara, sería una pausa entre canales, no un bug de concurrencia entre requests.',
        },
        {
          text: 'Sin `try/catch`, un fallo silencioso queda sin registrar en logs.',
          correct: false,
          why: 'El logging es un tema aparte. Y con `await` sin catch el error NO es silencioso: la función rechaza y el caller lo ve. El bug estructural es waterfall + fail-fast.',
        },
      ],
      takeaway: 'Refactorizar patrones a veces destapa otros bugs (acá, waterfall + fail-fast). Fix real: `Promise.allSettled(canalesElegidos.map(...))` — nivel 3 de la Sección C.',
    },
    {
      id: 'd3-tf2',
      kind: 'trueFalse',
      statement: 'Si no podés nombrar el patrón que estás usando, es que no estás usando ninguno.',
      answer: false,
      why: 'El patrón describe una estructura, y esa estructura aparece con o sin nombre — de hecho es lo más común: alguien resuelve el problema y después otro le pone el nombre en el review. El nombre no es lo que lo hace funcionar; es lo que permite hablar de eso en dos palabras y que el que lee sepa qué esperar. El error opuesto es más frecuente y más caro: forzar la nomenclatura sobre código que no la necesita y terminar con un UserServiceFactoryStrategyImpl que no resuelve nada que un módulo con dos funciones no resolviera mejor.',
    },
    {
      id: 'd3-q6',
      kind: 'multipleChoice',
      prompt:
        '¿Cuál es la heurística más útil para decidir si YA es momento de introducir un patrón?',
      choices: [
        {
          text: 'Esperar a la tercera repetición: con una es una coincidencia, con dos una sospecha, con tres tenés un eje de cambio real y sabés qué forma tiene.',
          correct: true,
          why: 'La regla de tres. Con dos casos el if casi siempre gana; con tres ya viste la forma que toma la variación, y la abstracción se ajusta a lo que pasa de verdad en vez de a lo que imaginaste.',
        },
        {
          text: 'Introducirlo apenas se ve la posibilidad de un segundo caso, para no tener que refactorizar después.',
          correct: false,
          why: 'Asume que refactorizar es caro. Con TypeScript y tests, extraer una abstracción a partir de dos casos concretos es de las operaciones más baratas y seguras que existen. Lo verdaderamente caro es DESARMAR la abstracción equivocada, porque para entonces hay código colgado de ella.',
        },
        {
          text: 'Cuando el archivo supera cierta cantidad de líneas.',
          correct: false,
          why: 'El tamaño no es la señal. Un archivo de 400 líneas con una sola razón de cambio está bien; uno de 80 con tres switches paralelos sobre el mismo tipo está pidiendo el patrón a gritos.',
        },
        {
          text: 'Cuando el equipo ya conoce bien el patrón, para que no genere fricción en el review.',
          correct: false,
          why: 'Que el equipo lo conozca baja el COSTO de introducirlo, y eso cuenta. Pero no crea el problema que lo justifica: aplicar un patrón porque el equipo lo maneja es la versión social de la sobreingeniería.',
        },
      ],
      takeaway: 'La regla de tres: una es coincidencia, dos es sospecha, tres es un eje.',
    },
  ],
  summary: [
    'Un patrón es una apuesta sobre qué eje va a cambiar. Si errás, pagás indirección para siempre.',
    'Singleton: sí para infraestructura (pool, cliente HTTP). Nunca para estado de la request — es un bug de seguridad.',
    'Factory con un solo caso, Repository en un script de una sola corrida: indirección sin beneficio.',
    'Olor de Strategy forzado: una jerarquía donde una de las estrategias no hace nada (un booleano disfrazado).',
    'Observer cambia acoplamiento por trazabilidad: el flujo deja de leerse y el orden queda implícito.',
    'Justificación completa = nombre + eje de cambio + qué gano y qué resigno. Sin la tercera parte, es citar autoridad.',
    'Regla de tres: una coincidencia, dos sospecha, tres un eje real. Con dos casos, el if suele ganar.',
    'Desarmar la abstracción equivocada cuesta más que no haberla escrito.',
  ],
};
