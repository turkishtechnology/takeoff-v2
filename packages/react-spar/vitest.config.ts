import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: 'react', replacement: path.resolve(here, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(here, 'node_modules/react-dom') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test-setup.ts', 'src/test-utils.tsx', 'src/**/types.ts'],
      reporter: ['text-summary', 'html'],
      // Floors sit just under the measured totals (99.55 / 97.57 / 99.83 / 99.96),
      // so a component that lands without tests fails CI while a few uncovered
      // defensive branches still fit.
      thresholds: { statements: 99, branches: 97, functions: 99, lines: 99 },
    },
  },
});
