#!/usr/bin/env node
/* eslint-disable no-console */
/* global process, console */

/**
 * Builds the Takeoff Icons changelog data: for every published version of
 * `@takeoff-icons/core`, which icons it added, which existing icons gained
 * variants, which were redrawn and which were removed.
 *
 * The data comes from the published packages themselves, not from release
 * notes: each version's tarball is downloaded from npm and compared with the
 * one before it. Icon names come from `iconMetadata`; drawings are compared
 * per icon and variant (`filled/rounded`, …) from the per-variant modules.
 *
 *   pnpm --filter docs gen:icons-changelog          download + write (needs network)
 *   pnpm --filter docs gen:icons-changelog:check    offline: the data covers the installed version
 *
 * Run the first one whenever `@takeoff-icons/*` is bumped and commit
 * `src/data/icons-changelog.json`. CI runs the check, so a bump without it fails.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PACKAGE = '@takeoff-icons/core';
const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsAppDir = resolve(scriptDir, '..');
const outFile = resolve(docsAppDir, 'src/data/icons-changelog.json');
const cacheDir = join(tmpdir(), 'takeoff-icons-changelog');

function installedVersion() {
  const pkg = JSON.parse(readFileSync(resolve(docsAppDir, 'node_modules', PACKAGE, 'package.json'), 'utf8'));
  return pkg.version;
}

function check() {
  if (!existsSync(outFile)) {
    console.error(`gen:icons-changelog:check — ${outFile} is missing; run pnpm --filter docs gen:icons-changelog`);
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(outFile, 'utf8'));
  const latest = data.releases[0]?.version;
  const installed = installedVersion();
  if (latest !== installed) {
    console.error(
      `gen:icons-changelog:check — the icons changelog ends at ${latest}, but the docs install ${PACKAGE}@${installed}.\n` +
        'Run `pnpm --filter docs gen:icons-changelog` and commit src/data/icons-changelog.json.',
    );
    process.exit(1);
  }
  console.log(`gen:icons-changelog:check — up to date (${installed})`);
}

/** Published versions (oldest first) and their publish dates, from the npm registry. */
function publishedVersions() {
  const raw = JSON.parse(execFileSync('npm', ['view', PACKAGE, 'versions', 'time', '--json'], { encoding: 'utf8' }));
  const versions = raw.versions.filter(v => !v.includes('-'));
  return versions.map(version => ({ version, date: raw.time[version]?.slice(0, 10) ?? null }));
}

/** Unpacks one version into the cache and returns its `dist` directory. */
function fetchVersion(version) {
  const dir = join(cacheDir, version);
  const dist = join(dir, 'package', 'dist');
  if (existsSync(join(dist, 'metadata.js'))) return dist;
  mkdirSync(dir, { recursive: true });
  const tarball = execFileSync('npm', ['pack', `${PACKAGE}@${version}`, '--silent', '--pack-destination', dir], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .pop();
  execFileSync('tar', ['xzf', join(dir, tarball), '-C', dir]);
  return dist;
}

/** Icon metadata by name, and every drawing keyed by `name|variant`. */
async function loadVersion(dist) {
  const { iconMetadata } = await import(pathToFileURL(join(dist, 'metadata.js')).href);
  const icons = new Map(iconMetadata.map(icon => [icon.name, icon]));
  const drawings = new Map();
  const iconsDir = join(dist, 'icons');
  for (const file of readdirSync(iconsDir, { recursive: true })) {
    if (!String(file).endsWith('.js')) continue;
    const module = await import(pathToFileURL(join(iconsDir, String(file))).href);
    for (const value of Object.values(module)) {
      if (value && typeof value === 'object' && typeof value.svg === 'string' && value.name && value.variant) {
        drawings.set(`${value.name}|${value.variant}`, value.svg);
      }
    }
  }
  return { icons, drawings };
}

function compare(previous, current) {
  const added = [...current.icons.keys()].filter(name => !previous.icons.has(name)).sort();
  const removed = [...previous.icons.keys()].filter(name => !current.icons.has(name)).sort();

  const newVariants = new Map();
  const redrawn = new Set();
  for (const [key, svg] of current.drawings) {
    const [name, variant] = key.split('|');
    if (!previous.icons.has(name)) continue; // a new icon, already listed as added
    if (!previous.drawings.has(key)) {
      newVariants.set(name, [...(newVariants.get(name) ?? []), variant]);
    } else if (previous.drawings.get(key) !== svg) {
      redrawn.add(name);
    }
  }

  return {
    added,
    removed,
    newVariants: [...newVariants].map(([name, variants]) => ({ name, variants: variants.sort() })).sort((a, b) => a.name.localeCompare(b.name)),
    redrawn: [...redrawn].sort(),
  };
}

async function generate() {
  const versions = publishedVersions();
  const releases = [];
  let previous = null;
  for (const { version, date } of versions) {
    const current = await loadVersion(fetchVersion(version));
    const release = { version, date, total: current.icons.size };
    if (previous) {
      Object.assign(release, compare(previous, current));
    } else {
      // The first release brought the whole set; listing it adds nothing the gallery doesn't show.
      Object.assign(release, { initial: true, added: [], removed: [], newVariants: [], redrawn: [] });
    }
    releases.push(release);
    console.log(
      `gen:icons-changelog — ${version}: ${release.total} icons` +
        (release.initial
          ? ' (first release)'
          : `, +${release.added.length} added, ${release.newVariants.length} with new variants, ${release.redrawn.length} redrawn, ${release.removed.length} removed`),
    );
    previous = current;
  }

  const data = { package: PACKAGE, releases: releases.reverse() };
  writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`gen:icons-changelog — wrote ${releases.length} releases to src/data/icons-changelog.json`);
}

if (process.argv.includes('--check')) {
  check();
} else {
  await generate();
}
