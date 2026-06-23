import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
  external: ['react', 'react-dom', '@turkish-technology/spar', '@takeoff-design/tokens', '@tanstack/react-table'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
