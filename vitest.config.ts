import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Config propia para los tests: NO reusamos vite.config.ts porque aquella
 * tiene `root: 'web'` y los tests viven fuera de la web (cubren el core, la
 * CLI y la web a la vez). Lo unico que comparten es el alias @core.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@core': fileURLToPath(new URL('./src/core', import.meta.url)) },
  },
  test: { include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'] },
});
