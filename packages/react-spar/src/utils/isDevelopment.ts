declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Returns `true` outside production builds. Bundlers (`tsup`, Vite, esbuild,
 * Webpack) inline `process.env.NODE_ENV` at build time, so the guarded code
 * block is dead-code-eliminated from production bundles.
 */
export const isDevelopment = (): boolean => typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';
