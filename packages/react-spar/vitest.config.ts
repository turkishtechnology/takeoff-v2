import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

// pnpm's `link:` dependency creates a relative symlink based on the depth of
// the package.json. From a git worktree the relative path is off by however
// many directories the worktree adds, so the symlink target doesn't exist.
// Fall back to walking parent directories until we find the spar source so
// `vitest` works from both the main checkout and any worktree without
// touching the on-disk symlink.
const resolveSparRoot = (): string => {
  const linkPath = path.resolve(here, 'node_modules/@turkish-technology/spar');
  try {
    const real = realpathSync(linkPath);
    if (existsSync(path.join(real, 'src/index.ts'))) return real;
  } catch {
    /* symlink broken — fall through */
  }
  let dir = here;
  while (dir !== path.parse(dir).root) {
    const candidate = path.join(dir, 'spar/packages/spar');
    if (existsSync(path.join(candidate, 'src/index.ts'))) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error('Cannot resolve @turkish-technology/spar source.');
};

const sparRoot = resolveSparRoot();

export default defineConfig({
  // The linked `@turkish-technology/spar` package brings its own
  // `node_modules/react`. Force every consumer to resolve to this package's
  // single React instance so React's hook dispatcher stays consistent across
  // the Spar/takeoff-spar boundary.
  resolve: {
    alias: [
      // Match Spar's tsconfig `@/*` -> spar src. Anchored to imports coming
      // from inside the spar package source so it never collides with other
      // packages that might use a `@/` prefix.
      { find: /^@\/(.*)$/, replacement: path.join(sparRoot, 'src/$1') },
      { find: '@turkish-technology/spar', replacement: path.join(sparRoot, 'src/index.ts') },
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
  },
});
