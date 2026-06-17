import { beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(__dirname, '..');
const ROOT = resolve(SCRIPTS_DIR, '..');
const DIST_DIR = resolve(ROOT, 'dist');
const TAILWIND_OUTPUT = JSON.parse(readFileSync(resolve(SCRIPTS_DIR, 'tailwind-output.json'), 'utf-8'));

function readDist(...segments) {
  return readFileSync(resolve(DIST_DIR, ...segments), 'utf-8');
}

function extractCssVarNames(block) {
  return new Set([...block.matchAll(/--([\w-]+)\s*:/g)].map(([, name]) => name));
}

describe('build-tokens.mjs integration', () => {
  beforeAll(() => {
    try {
      execSync('node scripts/build-tokens.mjs', {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 60_000,
      });
    } catch (err) {
      const stderr = err.stderr?.toString() || '';
      const stdout = err.stdout?.toString() || '';
      throw new Error(`Build failed:\nstdout: ${stdout}\nstderr: ${stderr}`, { cause: err });
    }
  }, 60_000);

  it('generates CSS variables with light and dark blocks', () => {
    const scssPath = resolve(DIST_DIR, 'scss/_variables.scss');
    expect(existsSync(scssPath)).toBe(true);

    const content = readFileSync(scssPath, 'utf-8');
    expect(content).toContain(':root {');
    expect(content).toContain("[data-theme='dark']");
    expect(content).toMatch(/--primary-\d+/);
    expect(content).toMatch(/--spacing-/);
    expect(content).toMatch(/--radius-/);
  });

  it('resolves DTCG references in generated CSS output', () => {
    const content = readDist('scss/_variables.scss');

    expect(content).toContain('--primary-base: var(--primary-500);');
    expect(content).toContain('--mobile-body-xl-font: var(--family-body);');
    expect(content).toContain("--family-body: 'TK Text';");
  });

  it('generates Tailwind v3 files from the shared output inventory', () => {
    const files = [...Object.values(TAILWIND_OUTPUT.v3ThemeFiles), ...Object.values(TAILWIND_OUTPUT.v3ComponentFiles)];

    for (const file of files) {
      const filePath = resolve(DIST_DIR, 'tailwind', file);
      expect(existsSync(filePath), `${file} should exist`).toBe(true);
      expect(readFileSync(filePath, 'utf-8')).toContain('@takeoff-design/tokens');
    }
  });

  it('generates Tailwind v3 theme modules with CSS variable references', () => {
    const colors = readDist('tailwind', TAILWIND_OUTPUT.v3ThemeFiles.colors);
    const spacing = readDist('tailwind', TAILWIND_OUTPUT.v3ThemeFiles.spacing);
    const screens = readDist('tailwind', TAILWIND_OUTPUT.v3ThemeFiles.screens);

    expect(colors).toContain("'primary-500': 'var(--primary-500)'");
    expect(spacing).toContain("'m-base': 'var(--spacing-m-base)'");
    expect(screens).toMatch(/md: '\d+px'/);
  });

  it('generates responsive typography classes from real build output', () => {
    const typography = readDist('tailwind', TAILWIND_OUTPUT.v3ComponentFiles.typography);
    const components = readDist('tailwind', TAILWIND_OUTPUT.v4ComponentFile);

    expect(typography).toContain("'.title-display-lg'");
    expect(typography).toContain("'.body-lg'");
    expect(typography).toContain('@media');
    expect(components).toContain('.title-display-lg');
    expect(components).toContain('.body-lg');
  });

  it('generates Tailwind v4 theme CSS', () => {
    const content = readDist('tailwind', TAILWIND_OUTPUT.v4ThemeFile);

    expect(content).toContain('@theme inline');
    expect(content).toContain('@layer components');
    expect(content).toMatch(/--color-primary-/);
    expect(content).toMatch(/--spacing-/);
    expect(content).toMatch(/--radius-/);
  });

  it('generates per-brand CSS and default JS tokens', () => {
    expect(existsSync(resolve(DIST_DIR, 'css/default/variables.css'))).toBe(true);
    expect(readDist('css/default/variables.css')).toContain(':root {');

    const tokens = readDist('js/default/tokens.mjs');
    expect(tokens).toContain('export const');
    expect(tokens).toContain('export default');
  });

  it('copies font assets to package dist outputs', () => {
    const fontPaths = [
      ['css/fonts.css'],
      ['assets/fonts/tk-font/tk-text/tk-text.woff2'],
      ['assets/fonts/tk-font/tk-text/tk-text.ttf'],
      ['assets/fonts/tk-font/tk-display/tk-display.woff2'],
      ['assets/fonts/tk-font/tk-display/tk-display.ttf'],
      ['css/assets/fonts/tk-font/tk-text/tk-text.woff2'],
      ['css/assets/fonts/tk-font/tk-display/tk-display.woff2'],
    ];

    for (const pathSegments of fontPaths) {
      const filePath = resolve(DIST_DIR, ...pathSegments);
      expect(existsSync(filePath), `${pathSegments.join('/')} should exist`).toBe(true);
    }
  });

  it('keeps dark token names within the light token set', () => {
    const content = readDist('scss/_variables.scss');
    const rootMatch = content.match(/:root\s*\{([\s\S]*?)\n\}/);
    const darkMatch = content.match(/\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/);

    expect(rootMatch).toBeTruthy();
    expect(darkMatch).toBeTruthy();

    const lightNames = extractCssVarNames(rootMatch[1]);
    const darkNames = extractCssVarNames(darkMatch[1]);

    for (const name of darkNames) {
      expect(lightNames.has(name), `--${name} is in dark but missing from light`).toBe(true);
    }
  });
});
