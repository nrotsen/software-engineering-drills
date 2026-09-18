import type { Level } from '../../domain/section.js';

export const level0: Level = {
  level: 0,
  title: 'Antes de los pilares',
  goal: 'Al terminar vas a tener el vocabulario mínimo —objeto, clase, instancia, método, mensaje— para que los 4 pilares del Nivel 1 tengan a qué agarrarse.',
  items: [
    {
      id: 'a0-t0',
      kind: 'theory',
      title: '¿Qué es un objeto?',
      body: 'Un objeto es un pedazo de programa que junta DATOS y las OPERACIONES que se pueden hacer sobre esos datos, en una sola unidad. Antes de OOP, los datos vivían en un lado (una struct, un diccionario) y las funciones que los tocaban en otro. La idea de "objeto" es que el dato y el código que sabe modificarlo viajen juntos, y que desde afuera se le mande a hacer cosas en vez de manosearlo directo.',
      analogy:
        'Un termo. Adentro tiene un estado (cuánta agua, a qué temperatura). Afuera tiene botones (servir, cerrar la tapa). No abrís el termo por arriba para sacarle agua: usás la boquilla que el termo te ofrece. Un objeto se maneja igual — le pedís cosas, no le metés la mano.',
    },
    {
      id: 'a0-q0',
      kind: 'multipleChoice',
      prompt: '¿Qué es lo característico de un objeto, comparado con una función suelta?',
      choices: [
        {
          text: 'Junta datos y las operaciones que los tocan en una sola unidad.',
          correct: true,
          why: 'Ese es el punto. Antes de OOP, los datos vivían en un lado (una struct) y las funciones que los tocaban en otro archivo. La idea del objeto es que viajen juntos.',
        },
        {
          text: 'Se ejecuta más rápido que una función suelta.',
          correct: false,
          why: 'La performance no es la diferencia. Los objetos existen por diseño, no por velocidad — a nivel máquina terminan siendo funciones y estructuras igual.',
        },
        {
          text: 'Ocupa menos memoria porque comparte código con otros del mismo tipo.',
          correct: false,
          why: 'Es un detalle de implementación, no la característica. Un lenguaje que copiara el código en cada instancia seguiría siendo OOP igual.',
        },
        {
          text: 'Puede llamar a otras funciones, cosa que una función suelta no puede hacer.',
          correct: false,
          why: 'Las funciones sueltas llaman a otras funciones sin problema. Lo distintivo del objeto es que lleva SU PROPIO estado sobre el que operar.',
        },
      ],
    },
    {
      id: 'a0-t1',
      kind: 'theory',
      title: 'Estado y comportamiento',
      body: 'Todo objeto tiene dos partes: ESTADO (los datos que guarda en un momento dado: el saldo de una cuenta, los ítems de un carrito) y COMPORTAMIENTO (lo que sabe hacer: depositar, agregar un ítem, calcular el total). El estado cambia con el tiempo; el comportamiento define QUÉ puede cambiar y CÓMO. Todo lo demás en OOP —los pilares, los patrones, SOLID— son formas de responder a la pregunta: ¿cómo hago para que el estado siga siendo válido y el comportamiento siga siendo entendible cuando el sistema crece?',
      analogy:
        'Un auto tiene estado (velocidad, combustible, marcha) y comportamiento (acelerar, frenar, cambiar de marcha). El estado cambia con cada acción. El comportamiento define las reglas: no podés poner reversa a 80 km/h. Un buen diseño en OOP es lo mismo — hace imposible poner el objeto en un estado que no debería existir.',
    },
    {
      id: 'a0-q1',
      kind: 'multipleChoice',
      prompt: 'En una clase Cuenta con `saldo` y métodos `depositar()` y `retirar()`, ¿qué es ESTADO y qué es COMPORTAMIENTO?',
      choices: [
        {
          text: 'saldo es el estado; depositar y retirar son el comportamiento.',
          correct: true,
          why: 'Estado = qué datos guarda el objeto en un momento dado. Comportamiento = qué sabe hacer. saldo cambia con cada operación; los métodos definen QUÉ operaciones son válidas.',
        },
        {
          text: 'Los tres son estado: son las cosas que tiene la cuenta.',
          correct: false,
          why: 'Confunde "estar declarado adentro" con "ser estado". Los métodos definen acciones, no datos que cambian con el tiempo — no son estado.',
        },
        {
          text: 'Los tres son comportamiento: son las cosas que hace la cuenta.',
          correct: false,
          why: 'saldo no HACE nada, es un valor que la cuenta guarda. El comportamiento son verbos (depositar, retirar); el estado son sustantivos (saldo).',
        },
        {
          text: 'saldo es el comportamiento; depositar y retirar son el estado.',
          correct: false,
          why: 'Está invertido. Los métodos son verbos: hacen cosas. saldo es un dato: se guarda. Estado = qué guardo, comportamiento = qué puedo hacer.',
        },
      ],
    },
    {
      id: 'a0-t2',
      kind: 'theory',
      title: 'Clase e instancia',
      body: 'La CLASE es el molde: describe qué estado tiene un tipo de objeto y qué comportamiento ofrece, pero no es un objeto en sí. La INSTANCIA es un objeto concreto creado a partir de ese molde, con su propio estado. Podés tener miles de instancias de la clase Cuenta, cada una con su saldo distinto, pero todas comparten el mismo comportamiento porque salieron del mismo molde. Cambiar la clase cambia todas las instancias futuras; cambiar una instancia sólo afecta a esa.',
      analogy:
        'Un formulario en blanco es la clase: define qué campos existen y qué se puede escribir en cada uno. Cada formulario ya rellenado es una instancia: mismo formato, distinto contenido. Modificar el formulario blanco cambia los que vas a imprimir después; tachar algo en uno ya rellenado sólo afecta a ese.',
    },
    {
      id: 'a0-q2',
      kind: 'multipleChoice',
      prompt: 'Tenés `class Perro { ... }` y `const firulais = new Perro()`. ¿Cuál es la clase y cuál es la instancia?',
      choices: [
        {
          text: 'Perro es la clase (el molde); firulais es la instancia (un objeto concreto con su propio estado).',
          correct: true,
          why: 'Perro describe qué forma tiene un perro pero no es un perro concreto. firulais sí es un perro específico creado con new: tiene nombre, edad, etc. propios.',
        },
        {
          text: 'Los dos son instancias — firulais está guardada en la variable, y Perro representa al concepto.',
          correct: false,
          why: 'Perro no es un objeto: es un molde. No podés hacer Perro.ladrar() como si fuera un perro; sólo podés crear perros a partir de él con new.',
        },
        {
          text: 'Perro es la instancia; firulais es la clase porque le pusiste un nombre propio.',
          correct: false,
          why: 'Está invertido. Poner nombre propio no convierte algo en clase. La clase es lo que declarás con class; la instancia aparece cuando hacés new.',
        },
        {
          text: 'Perro es la clase, firulais es una copia de la clase con todo el código adentro.',
          correct: false,
          why: 'firulais no lleva el código adentro. El comportamiento vive en la clase y todas las instancias lo comparten. firulais sólo lleva su ESTADO propio.',
        },
      ],
    },
    {
      id: 'a0-t3',
      kind: 'theory',
      title: 'Método y mensaje',
      body: 'MÉTODO es una función que vive adentro de una clase y opera sobre el estado de la instancia. Se distingue de una función suelta en que tiene acceso implícito a "yo mismo" —this en la mayoría de los lenguajes—: cuenta.depositar(100) sabe cuál es la cuenta sobre la que está trabajando. MANDAR UN MENSAJE es el nombre viejo (y más preciso) para "llamar a un método sobre un objeto": no le decís al objeto CÓMO hacer algo, sólo QUÉ querés que haga. La distinción no es trivial — es el germen del polimorfismo, que vas a ver en el Nivel 1.',
      analogy:
        'Le pedís al mozo "una milanesa con papas". Ese es el mensaje. Cómo la milanesa llega desde la cocina —quién la cocina, con qué receta, en qué orden— es problema de él. Vos no entrás a la cocina a supervisar. Cuando cambian de cocinero, el mozo te sigue trayendo la milanesa igual: el mensaje no cambió.',
    },
    {
      id: 'a0-q3',
      kind: 'multipleChoice',
      prompt: '¿Qué diferencia hay entre una función suelta y un método?',
      choices: [
        {
          text: 'El método tiene acceso implícito al objeto sobre el que se llama (this); la función suelta necesita que le pases todo por parámetro.',
          correct: true,
          why: 'Cuando escribís cuenta.depositar(100), el método sabe implícitamente que "yo mismo" es cuenta. Una función depositar(cuenta, 100) tiene que recibir la cuenta como argumento explícito.',
        },
        {
          text: 'El método puede modificar variables globales; la función suelta no.',
          correct: false,
          why: 'Ninguno tiene una limitación así por definición. Usar globales es problema de diseño, pero no distingue método de función.',
        },
        {
          text: 'La función suelta se llama sin paréntesis; el método con paréntesis.',
          correct: false,
          why: 'Los dos se llaman con paréntesis. La sintaxis no es lo que los diferencia — sí la relación con el objeto que los recibe.',
        },
        {
          text: 'Los métodos tienen que ser públicos; las funciones sueltas pueden ser privadas.',
          correct: false,
          why: 'Los métodos pueden ser privados (# en JS, private en TS/Java). Y las funciones sueltas no tienen concepto de "público/privado" — sólo scope de módulo.',
        },
      ],
    },
    {
      id: 'a0-t4',
      kind: 'theory',
      title: 'Por qué existe OOP',
      body: 'La pregunta que responde OOP es SIEMPRE la misma: cómo hago para que un cambio en un pedazo del sistema no se propague a los otros. Sin OOP, cuando cambia la forma de calcular el saldo, tenés que buscar TODOS los lugares del código donde se toca la cuenta y actualizarlos. Con objetos bien diseñados, el cálculo vive adentro de Cuenta y el resto del programa no se entera del cambio: le sigue mandando el mismo mensaje. Los 4 pilares del próximo nivel son cuatro respuestas complementarias a esta pregunta. Si en algún momento del recorrido te preguntás "¿para qué sirve esto en la práctica?", volvé acá: sirve para que un cambio no rompa cinco archivos ajenos.',
      analogy:
        'Un edificio con planos modulares: cambiar el baño no obliga a rediseñar la cocina. Cada módulo tiene una interfaz clara con los que lo rodean (las cañerías entran por acá, el aire sale por allá), y adentro cada uno hace lo suyo. Sin esa modularidad, mover un tomacorriente te obliga a rehacer el edificio entero.',
    },
    {
      id: 'a0-q4',
      kind: 'multipleChoice',
      prompt: '¿A qué pregunta responde OOP como paradigma?',
      choices: [
        {
          text: 'Cómo hago para que un cambio adentro de un módulo no se propague al resto del sistema.',
          correct: true,
          why: 'Es la misma pregunta que responden los 4 pilares, cada uno desde un ángulo distinto. Si en tu código hay que tocar 5 archivos ajenos cuando cambia algo, el diseño no está sosteniendo esa promesa.',
        },
        {
          text: 'Cómo hago para escribir la menor cantidad de código posible.',
          correct: false,
          why: 'OOP suele agregar código (interfaces, clases, ceremonial). Lo que reduce con el tiempo es la CANTIDAD DE LUGARES que hay que tocar cuando algo cambia, no la cantidad total.',
        },
        {
          text: 'Cómo hago para que el programa corra más rápido.',
          correct: false,
          why: 'OOP es un paradigma de organización, no de performance. El código bien organizado a veces corre más rápido, pero no es lo que resuelve.',
        },
        {
          text: 'Cómo hago para que dos programadores puedan trabajar en el mismo archivo sin conflictos.',
          correct: false,
          why: 'Eso es problema de control de versiones (Git). OOP puede ayudar a que dos módulos se editen en paralelo, pero no resuelve conflictos de línea.',
        },
      ],
    },
    {
      id: 'a0-q5',
      kind: 'multipleChoice',
      prompt: 'Mirá este código. Al final, ¿qué devuelven termo1.cuantoQueda() y termo2.cuantoQueda(), y por qué?',
      snippet: `
class Termo {
  #contenido = 0;
  llenar(ml) { this.#contenido = ml; }
  cuantoQueda() { return this.#contenido; }
}
const termo1 = new Termo();
const termo2 = new Termo();
termo1.llenar(500);
`,
      choices: [
        {
          text: '500 y 0. Cada instancia lleva su propio estado, aunque salgan del mismo molde.',
          correct: true,
          why: 'termo1 y termo2 son dos objetos distintos con su propio #contenido. Comparten el CÓMO (llenar, cuantoQueda) porque salen de la misma clase, pero no comparten el QUÉ tienen adentro.',
        },
        {
          text: '500 y 500. Como salen de la misma clase, comparten el estado #contenido.',
          correct: false,
          why: 'La clase es el molde, no un contenedor de estado. Cada new Termo() crea un objeto con su propio #contenido. Lo que sí comparten es el CÓDIGO de los métodos.',
        },
        {
          text: '0 y 0. Como #contenido es privado, llenar() no lo puede modificar.',
          correct: false,
          why: 'La restricción de privado es DESDE AFUERA de la clase. Adentro de un método (como llenar), acceder a #contenido está permitido — es su propio campo.',
        },
        {
          text: 'Error de sintaxis. No se pueden crear dos instancias del mismo constructor en un mismo scope.',
          correct: false,
          why: 'Sí se puede. Podés crear tantas instancias como quieras con new; cada una es un objeto independiente. Es característica base de OOP, no una limitación.',
        },
      ],
      takeaway: 'La clase es el molde: se comparte el CÓMO (los métodos). Cada instancia lleva SU propio QUÉ (el estado).',
    },
  ],
  summary: [
    'Objeto = estado + comportamiento en una sola unidad. Se le manda a hacer cosas, no se le mete mano.',
    'Clase = molde (describe la forma). Instancia = objeto concreto (lleva el estado).',
    'Método = función atada a un objeto. Mandarle un mensaje = decir QUÉ querés, no CÓMO.',
    'OOP existe para que un cambio adentro de un objeto no se propague afuera. Los 4 pilares son cuatro formas de conseguir eso.',
  ],
};
