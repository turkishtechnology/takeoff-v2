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
const gapsPath = resolve(repoRoot, '.agents/skills/migrate-takeoff-v1/references/gaps.md');
const docsPath = resolve(repoRoot, 'apps/docs/docs/migration-v1.mdx');
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

function section(source, heading) {
  const headings = [...source.matchAll(/^##\s+(.+?)\s*$/gmu)];
  const index = headings.findIndex(match => match[1] === heading);
  if (index === -1) return null;
  const start = headings[index].index + headings[index][0].length;
  const end = index + 1 < headings.length ? headings[index + 1].index : source.length;
  return source.slice(start, end);
}

// Only the mapping tables' target column and the explicit `v2 opportunities` list count as a
// recorded mapping. A backticked PascalCase word anywhere in prose would otherwise defeat the CI
// gate that is meant to surface a newly shipped component nobody has reviewed yet.
function existingTargets(source) {
  const targets = new Set();
  // The block is replaced by a sentinel heading rather than removed, so it bounds the last
  // hand-written section instead of letting anything after it merge in.
  const sourceWithoutGeneratedSection = source.replace(new RegExp(`${START}[\\s\\S]*?${END}`, 'u'), '\n## generated v2 component coverage\n');
  for (const match of sourceWithoutGeneratedSection.matchAll(/^\|[^\n]*\|\s*`?([A-Z][A-Za-z]+)`?\s*\|/gmu)) targets.add(match[1]);
  // `Special mappings` and `v2 opportunities` record their targets in prose, not in a bare target
  // cell, so the whole section is scanned. Every other section stays table-only, which is what
  // keeps an incidental prose mention from defeating the gate.
  for (const heading of ['Special mappings', 'v2 opportunities']) {
    const body = section(sourceWithoutGeneratedSection, heading);
    if (body === null) {
      console.error(`Migration component map has no "## ${heading}" section: ${mapPath}`);
      process.exit(1);
    }
    for (const match of body.matchAll(/`([A-Z][A-Za-z]+)`/gu)) targets.add(match[1]);
  }
  return targets;
}

function readOrExit(path, label) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    console.error(`Cannot read the ${label}: ${path}`);
    process.exit(1);
  }
}

// The v1-only gap list lives in three places: component-map.md (the bucket the migration inventory
// reads), gaps.md (the per-gap guidance), and the public migration guide. Nothing else keeps them
// honest, so a gap that closes in one file cannot be left open in the others.
//
// The second half of this check is the one that actually fires over time: when v2 finally ships a
// component that closes a gap, every list above still says "no shipped v2 target" and agrees with
// itself, so comparing them to each other proves nothing. They are compared against the shipped
// directory too.
function checkGapsInSync(source) {
  const declaredSection = section(source, 'v1-only gaps');
  if (declaredSection === null) {
    console.error(`Migration component map has no "## v1-only gaps" section: ${mapPath}`);
    process.exit(1);
  }
  const tkNames = text => new Set([...text.matchAll(/`(Tk[A-Za-z0-9]*)`/gu)].map(match => match[1]));
  const declared = tkNames(declaredSection);

  const gapsDoc = readOrExit(gapsPath, 'gap reference');
  const documented = tkNames(gapsDoc);

  // The guide restates the list for readers who never open the skill. Match the paragraph that
  // follows the lead-in sentence rather than the whole page, so an unrelated `TkFoo` mention
  // elsewhere in the guide is not read as a gap declaration.
  const docsDoc = readOrExit(docsPath, 'migration guide');
  const docsParagraph = /have no shipped v2 target:\s*\n\s*\n([\s\S]*?)\n\s*\n/u.exec(docsDoc);
  if (docsParagraph === null) {
    console.error(`Migration guide has no "have no shipped v2 target:" gap paragraph: ${docsPath}`);
    process.exit(1);
  }
  const published = tkNames(docsParagraph[1]);

  const shipped = new Set(shippedComponents());

  const problems = [
    ...[...declared].filter(name => !documented.has(name)).map(name => `${name} is a gap in component-map.md but has no row in gaps.md`),
    ...[...documented].filter(name => !declared.has(name)).map(name => `${name} has a row in gaps.md but is not a gap in component-map.md`),
    ...[...declared]
      .filter(name => !published.has(name))
      .map(name => `${name} is a gap in component-map.md but is missing from the gap list in ${docsPath.replace(`${repoRoot}/`, '')}`),
    ...[...published].filter(name => !declared.has(name)).map(name => `${name} is listed as a gap in ${docsPath.replace(`${repoRoot}/`, '')} but is not a gap in component-map.md`),
    // `TkRating` closes when `packages/react-spar/src/components/rating/` appears. The name match is
    // a heuristic — a v1 export can map to a differently named v2 component — but it errs toward a
    // false alarm a human clears by recording the mapping, never toward a gap that silently rots.
    ...[...declared]
      .filter(name => shipped.has(name.slice('Tk'.length)))
      .map(
        name =>
          `${name} is still listed as a gap, but v2 ships \`${name.slice('Tk'.length)}\`. Give it a mapping row and drop it from gaps.md and the guide, or rename the v2 component.`,
      ),
  ];
  const stated = /These (\d+) v1 exports/u.exec(gapsDoc);
  if (stated && Number(stated[1]) !== declared.size) {
    problems.push(`gaps.md says "These ${stated[1]} v1 exports" but component-map.md lists ${declared.size}`);
  }
  if (problems.length > 0) {
    console.error('Gap lists are out of sync:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  return declared.size;
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
  const targets = existingTargets(source);
  const missing = shippedComponents().filter(component => !targets.has(component));
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
const gapCount = checkGapsInSync(current);
const next = await update(current);

if (checkMode) {
  if (current !== next) {
    console.error('Migration component map is out of date. Run `pnpm gen:migration-map`.');
    process.exit(1);
  }
  console.log(`Migration component map is in sync (${gapCount} gaps consistent with gaps.md, the guide, and the shipped components).`);
} else {
  writeFileSync(mapPath, next);
  console.log(`Updated ${mapPath.replace(`${repoRoot}/`, '')} (${gapCount} gaps consistent with gaps.md, the guide, and the shipped components).`);
}
