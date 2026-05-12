import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const reactSparSourceDir = resolve(__dirname, '../../packages/react-spar/src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@takeoff-ui/react-spar',
        replacement: resolve(reactSparSourceDir, 'index.ts'),
      },
    ],
  },
});
