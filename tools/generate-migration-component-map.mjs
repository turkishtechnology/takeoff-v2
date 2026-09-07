#!/usr/bin/env node

/* eslint-disable no-console */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const componentsDir = resolve(repoRoot, 'packages/react-spar/src/components');
const mapPath = resolve(repoRoot, '.agents/skills/migrate-takeoff-v1/references/component-map.md');
const checkMode = process.argv.includes('--check');

const START = '<!-- BEGIN GENERATED V2 COMPONENT COVERAGE -->';
const END = '<!-- END GENERATED V2 COMPONENT COVERAGE -->';

const pascalCase = value => value.replace(/(^|-)([a-z])/gu, (_, __, letter) => letter.toUpperCase());

function shippedComponents() {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => pascalCase(entry.name))
    .sort();
}

function existingTargets(source) {
  const targets = new Set();
  for (const match of source.matchAll(/^\|[^\n]*\|\s*`?([A-Z][A-Za-z]+)`?\s*\|/gmu)) targets.add(match[1]);
  for (const match of source.matchAll(/^`([A-Z][A-Za-z]+)`/gmu)) targets.add(match[1]);
  return targets;
}

function generatedSection(missing) {
  if (missing.length === 0) return `${START}\n${END}`;
  return [
    START,
    '',
    '## Newly shipped v2 components',
    '',
    'These rows are generated from `packages/react-spar/src/components/`. They',
    'have no explicit v1 mapping yet; read the matching `takeoff-<name>` skill',
    'before deciding whether the component is a migration target or a v2-only',
    'opportunity.',
    '',
    '| v2 component | v1 mapping status |',
    '| --- | --- |',
    ...missing.map(component => `| \`${component}\` | No v1 mapping recorded; inspect the component skill. |`),
    '',
    END,
  ].join('\n');
}

async function update(source) {
  const missing = shippedComponents().filter(component => !existingTargets(source).has(component));
  const section = generatedSection(missing);
  const block = new RegExp(`${START}[\\s\\S]*?${END}`, 'u');
  const next = block.test(source) ? source.replace(block, section) : `${source.trimEnd()}\n\n${section}\n`;
  const config = await prettier.resolveConfig(mapPath);
  return prettier.format(next, { ...config, filepath: mapPath, parser: 'markdown' });
}

if (!existsSync(mapPath)) {
  console.error(`Migration component map is missing: ${mapPath}`);
  process.exit(1);
}

const current = readFileSync(mapPath, 'utf8');
const next = await update(current);

if (checkMode) {
  if (current !== next) {
    console.error('Migration component map is out of date. Run `pnpm gen:migration-map`.');
    process.exit(1);
  }
  console.log('Migration component map is in sync.');
} else {
  writeFileSync(mapPath, next);
  console.log(`Updated ${mapPath.replace(`${repoRoot}/`, '')}.`);
}
