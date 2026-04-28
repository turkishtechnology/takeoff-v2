import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // The linked `@turkish-technology/spar` package brings its own
  // `node_modules/react`. Force every consumer to resolve to this package's
  // single React instance so React's hook dispatcher stays consistent across
  // the Spar/takeoff-spar boundary.
  resolve: {
    alias: {
      'react': path.resolve(here, 'node_modules/react'),
      'react-dom': path.resolve(here, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
