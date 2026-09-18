import chalk from 'chalk';

/**
 * Un unico lugar donde se decide "de que color es cada cosa".
 *
 * Por que no usar `chalk.green(...)` suelto por todo el codigo: si manana
 * queres cambiar la paleta, agregar modo sin color (NO_COLOR), o testear la
 * salida, tocas un archivo. Es la misma idea que los design tokens en CSS.
 */
export const theme = {
  title: (s: string) => chalk.bold.cyan(s),
  section: (s: string) => chalk.bold.white(s),
  theory: (s: string) => chalk.white(s),
  analogy: (s: string) => chalk.italic.magenta(s),
  question: (s: string) => chalk.bold.yellow(s),
  ok: (s: string) => chalk.green(s),
  err: (s: string) => chalk.red(s),
  partial: (s: string) => chalk.yellow(s),
  why: (s: string) => chalk.gray(s),
  code: (s: string) => chalk.cyan(s),
  diagram: (s: string) => chalk.blue(s),
  dim: (s: string) => chalk.dim(s),
  accent: (s: string) => chalk.bold.magenta(s),
  badge: (s: string) => chalk.bgBlue.black(` ${s} `),
};

export const icons = {
  ok: '✔', // ✔
  err: '✘', // ✘
  partial: '≈', // ≈
  arrow: '→', // →
  bullet: '•', // •
  lock: '○', // ○
  done: '●', // ●
};
