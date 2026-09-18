/**
 * Los TIPOS de item de estudio.
 *
 * Decision de diseno: `Item` es una *union discriminada* (discriminated union),
 * no una jerarquia de clases con herencia.
 *
 *   - El contenido queda como DATOS puros: sin metodos, sin `this`, serializable.
 *   - El comportamiento (como se renderiza y se puntua cada tipo) vive en
 *     `engine/handlers/`, separado del dato. Eso es Strategy con funciones.
 *   - TypeScript nos da exhaustiveness checking gratis: si agregas un `kind`
 *     nuevo y te olvidas del handler, el proyecto NO compila.
 *
 * Trade-off vs. la version OOP clasica (`abstract class Item { render() }`):
 * con clases el polimorfismo es mas "de manual" y el despacho es automatico,
 * pero acoplas el dato al comportamiento y perdes que el contenido sea data.
 * Ver README, seccion "Herencia vs composicion en este repo".
 */

/** Cada opcion lleva SU PROPIA explicacion. Ver nota al final del archivo. */
export interface Choice {
  readonly text: string;
  readonly correct: boolean;
  /** Por que esta bien, o por que es una trampa plausible. */
  readonly why: string;
}

interface ItemBase {
  /** Unico dentro del nivel. Sirve para debug y, a futuro, para modo repaso. */
  readonly id: string;
}

/** Teoria breve: 2-4 frases + una analogia. No puntua. */
export interface TheoryItem extends ItemBase {
  readonly kind: 'theory';
  readonly title: string;
  readonly body: string;
  readonly analogy: string;
}

/** Diagrama ASCII para conceptos visuales. No puntua. */
export interface DiagramItem extends ItemBase {
  readonly kind: 'diagram';
  readonly title: string;
  readonly ascii: string;
  readonly caption: string;
}

/** Multiple choice: 3-4 opciones, se elige por numero. */
export interface MultipleChoiceItem extends ItemBase {
  readonly kind: 'multipleChoice';
  readonly prompt: string;
  readonly choices: readonly Choice[];
  /**
   * Snippet opcional que se muestra ANTES de las opciones.
   *
   * Existe para las preguntas del tipo "identifica el patron en este codigo",
   * donde la respuesta es objetiva (una de seis opciones) y por lo tanto no
   * corresponde autoevaluarse como en un `CodeItem`.
   *
   * Es puramente PRESENTACION: `grade()` ni lo mira. La respuesta se sigue
   * evaluando por la opcion elegida, exactamente igual que antes. Por eso el
   * campo pudo agregarse sin tocar la correccion ni romper ningun item.
   */
  readonly snippet?: string;
  /**
   * Ejemplo de codigo OPCIONAL que se despliega despues de responder.
   *
   * Refuerza el concepto con codigo aplicado sin ensuciar el prompt. Se
   * renderiza colapsado ("Ver ejemplo en codigo") para no distraer al que ya
   * entendio. No participa de la correccion.
   */
  readonly codeExample?: string;
  /** Frase para llevarse, se muestra despues de la correccion. */
  readonly takeaway?: string;
}

export interface TrueFalseItem extends ItemBase {
  readonly kind: 'trueFalse';
  readonly statement: string;
  readonly answer: boolean;
  readonly why: string;
  /** Mismo rol que en `MultipleChoiceItem`: refuerzo post-respuesta, opcional. */
  readonly codeExample?: string;
}

/**
 * Ejercicio de codigo abierto: se muestra un snippet, se pide predecir la
 * salida / detectar el patron / decir que esta mal, y despues se revela.
 * Se puntua por AUTOEVALUACION (no ejecutamos ni parseamos tu respuesta).
 *
 * Cuando el autor provee `choices`, la UI ofrece un toggle "Elegir opcion /
 * Escribir" arriba del ejercicio. Elegir opcion evalua objetivamente (como un
 * MC); escribir mantiene la autoevaluacion. Es el mismo item — solo cambia
 * como el usuario ingresa la respuesta y como se puntua (ver `grade()`).
 */
export interface CodeItem extends ItemBase {
  readonly kind: 'code';
  readonly ask: string;
  readonly snippet: string;
  readonly answer: string;
  readonly why: string;
  /** Camino alternativo objetivo: si esta, la UI ofrece responder por MC. */
  readonly choices?: readonly Choice[];
}

/** Respuesta numerica (calculos de latencia). Tolerancia opcional. */
export interface NumericItem extends ItemBase {
  readonly kind: 'numeric';
  readonly prompt: string;
  readonly answer: number;
  readonly unit?: string;
  /** Margen aceptado, en valor absoluto. Default 0. */
  readonly tolerance?: number;
  readonly why: string;
  readonly hint?: string;
}

export type Item =
  | TheoryItem
  | DiagramItem
  | MultipleChoiceItem
  | TrueFalseItem
  | CodeItem
  | NumericItem;

export type ItemKind = Item['kind'];

/** Los items que suman al puntaje (teoria y diagramas no). */
export type ScorableItem = Exclude<Item, TheoryItem | DiagramItem>;

export function isScorable(item: Item): item is ScorableItem {
  return item.kind !== 'theory' && item.kind !== 'diagram';
}

/*
 * NOTA sobre `Choice.why` (una por opcion, no una explicacion global):
 * cuesta mas al escribir contenido, pero (a) el aprendizaje real esta en
 * entender por que la trampa era plausible, y (b) permite barajar el orden
 * de las opciones sin que ninguna explicacion diga "la opcion 2".
 */
