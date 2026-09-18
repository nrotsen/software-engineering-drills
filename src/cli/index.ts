#!/usr/bin/env node
import { InquirerIo } from './inquirer-io.js';
import { JsonProgressStore } from './json-store.js';
import { shuffle } from '../core/shuffle.js';
import { runApp } from './menu.js';
import { theme } from './theme.js';

/**
 * COMPOSITION ROOT: el unico lugar del programa donde se eligen las
 * implementaciones concretas (inquirer, JSON en disco, Math.random) y se
 * arman las dependencias. Todo lo de abajo recibe interfaces.
 *
 * Es la contracara practica de la inversion de dependencias: si el resto del
 * codigo no hace `new` de nada concreto, alguien tiene que hacerlo, y ese
 * alguien es un solo archivo, arriba de todo.
 */
async function main(): Promise<void> {
  const io = new InquirerIo();
  const store = new JsonProgressStore();

  try {
    await runApp({ io, store, shuffle });
  } catch (error) {
    // Ctrl-C en un prompt de inquirer llega como ExitPromptError.
    if (error instanceof Error && error.name === 'ExitPromptError') {
      io.print();
      io.print(theme.dim('Salida. Tu progreso quedó guardado hasta el último nivel completo.'));
      return;
    }
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(theme.err('\nError inesperado:'), error);
  process.exitCode = 1;
});
