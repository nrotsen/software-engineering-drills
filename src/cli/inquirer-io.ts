import { input, select } from '@inquirer/prompts';
import type { Io, SelectChoice } from './io.js';
import { theme } from './theme.js';

/** ADAPTER: traduce el puerto `Io` a la API concreta de @inquirer/prompts. */
export class InquirerIo implements Io {
  print(text = ''): void {
    console.log(text);
  }

  clear(): void {
    console.clear();
  }

  async select<T>(message: string, choices: readonly SelectChoice<T>[]): Promise<T> {
    return select<T>({
      message,
      choices: choices.map((c) => ({
        name: c.name,
        value: c.value,
        ...(c.description !== undefined ? { description: c.description } : {}),
        ...(c.disabled !== undefined ? { disabled: c.disabled } : {}),
      })),
      pageSize: 12,
      loop: false,
    });
  }

  async number(message: string, hint?: string): Promise<number> {
    const raw = await input({
      message: hint ? `${message} ${theme.dim(`(${hint})`)}` : message,
      validate: (value) => (parseNumber(value) === undefined ? 'Escribi un numero.' : true),
    });
    return parseNumber(raw) as number;
  }

  async text(message: string): Promise<string> {
    return input({ message });
  }

  async pause(message = 'Enter para continuar'): Promise<void> {
    await input({ message: theme.dim(message), theme: { prefix: '' } });
  }
}

/** Acepta "1200", "1.200", "1200 ms", "1,5". Devuelve undefined si no es numero. */
function parseNumber(raw: string): number | undefined {
  const cleaned = raw.trim().replace(/\s|ms|s$/gi, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  if (cleaned === '') return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}
