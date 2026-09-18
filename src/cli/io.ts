/**
 * PUERTO de entrada/salida.
 *
 * El motor (`engine/`) habla SOLO con esta interfaz, nunca con inquirer ni con
 * `console.log`. Es Dependency Inversion: el modulo de alto nivel (el motor)
 * define el contrato, y el detalle de infraestructura (inquirer) lo implementa.
 *
 * Que gano concretamente:
 *   - Puedo testear el loop de un nivel con un `FakeIo` que devuelve respuestas
 *     enlatadas, sin TTY y sin sleeps. Ver `tests/`.
 *   - Puedo cambiar inquirer por otra libreria tocando UN archivo.
 * Que resigno: una indirección mas, y hoy hay una sola implementacion real.
 */

export interface SelectChoice<T> {
  readonly name: string;
  readonly value: T;
  readonly description?: string;
  /** `true` o un texto de motivo para mostrar la opcion deshabilitada. */
  readonly disabled?: boolean | string;
}

export interface Io {
  print(text?: string): void;
  clear(): void;
  select<T>(message: string, choices: readonly SelectChoice<T>[]): Promise<T>;
  /** Devuelve un numero ya validado. */
  number(message: string, hint?: string): Promise<number>;
  text(message: string): Promise<string>;
  /** Espera un Enter. Se usa para separar "pensa la respuesta" de "revelala". */
  pause(message?: string): Promise<void>;
}
