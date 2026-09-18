import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // La app web vive en web/, pero el CORE vive en src/core/ — fuera del root
  // de Vite. Por eso el alias + fs.allow: le decimos al dev server que puede
  // servir archivos del repo entero, no solo de web/.
  root: 'web',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@core': fileURLToPath(new URL('./src/core', import.meta.url)) },
  },
  server: { fs: { allow: [repoRoot] } },
  build: { outDir: '../dist-web', emptyOutDir: true },
});
