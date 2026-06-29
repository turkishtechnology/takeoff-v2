#!/usr/bin/env node
/* eslint-disable no-console */
/* global process, console */

/**
 * CI drift guard for the generated API tables.
 *
 * The API reference block of each component MDX page is generated from the
 * component's `types.ts` by `generate-api-mdx.mjs`. That block only refreshes
 * when someone runs `pnpm --filter docs gen:api`; editing `types.ts` without
 * re-running it leaves the docs silently stale (e.g. a new `TableSlot` slot or
 * a reworded prop description never reaches the published page).
 *
 * This script snapshots the component MDX pages, regenerates the tables, and
 * fails if regeneration changed any page — i.e. the committed docs had drifted
 * from the source types. The fix is always the same: run the generator and
 * commit the result.
 *
 * It compares each page against a snapshot taken in THIS run (not against git
 * HEAD), so unrelated uncommitted edits to a page — e.g. hand-written demos
 * outside the generated block — never trip a false positive. Only output the
 * generator itself produced counts.
 *
 * Run from anywhere:
 *   pnpm --filter docs gen:api:check
 */

import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsAppDir = resolve(scriptDir, '..');
const repoRoot = resolve(docsAppDir, '../..');
const componentsDir = resolve(docsAppDir, 'docs/components');

async function readComponentPages() {
  const entries = await readdir(componentsDir, { withFileTypes: true });
  const pages = new Map();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const full = resolve(componentsDir, entry.name);
    pages.set(full, await readFile(full, 'utf8'));
  }
  return pages;
}

// 1. Snapshot the pages BEFORE regeneration so we measure only what the
//    generator changes, independent of any pre-existing working-tree edits.
const before = await readComponentPages();

// 2. Regenerate the API tables in place.
const gen = spawnSync('node', [resolve(scriptDir, 'generate-api-mdx.mjs')], { cwd: repoRoot, stdio: 'inherit' });
if (gen.error) throw gen.error;
if (gen.status !== 0) {
  console.error('\n✗ API table generation failed — see the error above.');
  process.exit(gen.status ?? 1);
}

// 3. Re-read and flag only the pages whose content the generator changed.
const after = await readComponentPages();
const changed = [];
for (const [path, content] of after) {
  if (before.get(path) !== content) changed.push(relative(repoRoot, path));
}

if (changed.length > 0) {
  console.error('\n✗ Generated API tables are out of date with the component source types.');
  console.error('  Regeneration changed these docs pages:\n');
  for (const file of changed.sort()) console.error(`    - ${file}`);
  console.error('\n  Fix: run `pnpm --filter docs gen:api` and commit the result.');
  process.exit(1);
}

console.log('\n✓ Generated API tables are in sync with the component source types.');
