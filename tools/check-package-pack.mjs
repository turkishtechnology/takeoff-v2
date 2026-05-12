#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const tailwindOutput = JSON.parse(readFileSync(resolve(root, 'packages/tokens/scripts/tailwind-output.json'), 'utf8'));
const tailwindV3ThemeFiles = Object.values(tailwindOutput.v3ThemeFiles);
const tailwindV3ComponentFiles = Object.values(tailwindOutput.v3ComponentFiles);

const configs = {
  tokens: {
    dir: resolve(root, 'packages/tokens'),
    required: [
      'package.json',
      'README.md',
      'LICENSE',
      'dist/css/default/theme.css',
      'dist/css/default/variables.css',
      'dist/css/fonts.css',
      'dist/js/default/tokens.mjs',
      'dist/scss/_components.scss',
      'dist/scss/_variables.scss',
      `dist/tailwind/${tailwindOutput.v4ThemeFile}`,
      ...tailwindV3ThemeFiles.map(file => `dist/tailwind/${file}`),
      ...tailwindV3ComponentFiles.map(file => `dist/tailwind/${file}`),
    ],
    allowedFiles: ['package.json', 'README.md', 'LICENSE'],
    allowedPrefixes: ['dist/'],
    forbiddenPrefixes: ['.cache/', '.turbo/', 'scripts/', 'styles/', 'tokens/', 'dist/scss/components/'],
    forbiddenFiles: ['vitest.config.ts', 'dist/tailwind/components.css'],
  },
  tailwind: {
    dir: resolve(root, 'packages/tailwind'),
    required: [
      'package.json',
      'README.md',
      'LICENSE',
      `dist/v4/${tailwindOutput.v4ThemeFile}`,
      'dist/v3/index.js',
      ...tailwindV3ThemeFiles.map(file => `dist/v3/theme/${file}`),
      ...tailwindV3ComponentFiles.map(file => `dist/v3/components/${file}`),
    ],
    allowedFiles: ['package.json', 'README.md', 'LICENSE'],
    allowedPrefixes: ['dist/'],
    forbiddenPrefixes: ['.cache/', '.turbo/', 'scripts/'],
    forbiddenFiles: [],
  },
};

const target = process.argv[2];
const config = configs[target];

if (!config) {
  console.error(`Usage: node tools/check-package-pack.mjs ${Object.keys(configs).join('|')}`);
  process.exit(1);
}

if (!existsSync(resolve(config.dir, 'package.json'))) {
  console.error(`Package directory is missing package.json: ${config.dir}`);
  process.exit(1);
}

const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: config.dir,
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.stderr.write(result.stdout);
  process.exit(result.status ?? 1);
}

let payload;
try {
  payload = JSON.parse(result.stdout);
} catch {
  console.error('Could not parse npm pack --dry-run --json output.');
  process.stdout.write(result.stdout);
  process.exit(1);
}

const [packInfo] = payload;
const files = new Set((packInfo?.files ?? []).map(file => file.path));
const errors = [];

for (const required of config.required) {
  if (!files.has(required)) errors.push(`Missing required file: ${required}`);
}

for (const file of files) {
  const allowed = config.allowedFiles.includes(file) || config.allowedPrefixes.some(prefix => file.startsWith(prefix));
  if (!allowed) errors.push(`Unexpected file in package: ${file}`);
  if (config.forbiddenFiles.includes(file)) errors.push(`Forbidden file in package: ${file}`);
  for (const prefix of config.forbiddenPrefixes) {
    if (file.startsWith(prefix)) errors.push(`Forbidden path in package: ${file}`);
  }
}

if (errors.length > 0) {
  const packageJson = JSON.parse(readFileSync(resolve(config.dir, 'package.json'), 'utf8'));
  console.error(`${packageJson.name}@${packageJson.version} package contents are not publish-ready:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`${packInfo.name}@${packInfo.version}: ${files.size} files verified for publish.`);
