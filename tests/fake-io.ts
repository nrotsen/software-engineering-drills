import type { Io, SelectChoice } from '../src/cli/io.js';

/**
 * Doble de prueba del puerto `Io`. Recibe un guion de respuestas y las va
 * devolviendo en orden. Esto es lo que compra la interfaz `Io`: podemos correr
 * el motor completo sin TTY, sin timers y de forma determinista.
 */
export class FakeIo implements Io {
  readonly output: string[] = [];
  private readonly script: unknown[];

  constructor(script: readonly unknown[] = []) {
    this.script = [...script];
  }

  get text_(): string {
    return this.output.join('\n');
  }

  private next<T>(kind: string): T {
    if (this.script.length === 0) throw new Error(`FakeIo: se acabó el guion en un ${kind}`);
    return this.script.shift() as T;
  }

  print(text = ''): void {
    this.output.push(text);
  }

  clear(): void {}

  async select<T>(_message: string, choices: readonly SelectChoice<T>[]): Promise<T> {
    const index = this.next<number>('select');
    const choice = choices[index];
    if (!choice) throw new Error(`FakeIo: índice ${index} fuera de rango (${choices.length} opciones)`);
    return choice.value;
  }

  async number(): Promise<number> {
    return this.next<number>('number');
  }

  async text(): Promise<string> {
    return this.next<string>('text');
  }

  async pause(): Promise<void> {}
}
