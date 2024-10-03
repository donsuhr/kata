import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: '../../../vitest.config.mjs',
    coverage: {
      all: false,
      enabled: true,
      reportsDirectory: '../coverage',
    },
  },
});
