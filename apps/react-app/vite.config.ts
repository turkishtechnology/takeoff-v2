import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const reactSparSourceDir = resolve(__dirname, '../../packages/react-spar/src');
const sparPackageDir = resolve(__dirname, '../../packages/react-spar/node_modules/@turkish-technology/spar');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@turkish-technology/spar',
        replacement: sparPackageDir,
      },
      {
        find: '@takeoff-ui/react-spar',
        replacement: resolve(reactSparSourceDir, 'index.ts'),
      },
    ],
  },
});
