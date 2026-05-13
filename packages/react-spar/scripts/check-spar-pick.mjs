#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Guard: wrapper component types must consume Spar prop types only through
 * `Pick<SparFooProps, ...>` — never via bare extension or `&` intersection.
 *
 * Scans `src/components/<name>/types.ts` and fails CI when it finds:
 *   - `extends ... Spar<Name>Props` outside a `Pick<...>` clause
 *   - `& Spar<Name>Props` intersection with a Spar prop type
 *
 * Additionally warns (does not fail) when a `Pick<Spar...Props, ...>` is not
 * immediately preceded by a comment — the intent comment is a contract
 * requirement (see docs/component-authoring-contract.md#public-type-boundary).
 *
 * Run via: pnpm --filter @takeoff-ui/react-spar lint:spar-pick
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(scriptDir, '../src/components');

function collectTypeFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTypeFiles(full));
    } else if (entry === 'types.ts') {
      out.push(full);
    }
  }
  return out;
}

const errors = [];
const warnings = [];

const pickWithSparRegex = /\bPick\s*<\s*Spar[A-Z]\w*Props\b/g;
const intersectionRegex = /&\s*Spar[A-Z]\w*Props\b/;

// Strip import blocks and line/block comments so we only scan type positions.
function stripIgnored(src) {
  // Replace block comments with same-length whitespace to preserve offsets.
  let out = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  // Replace line comments similarly.
  out = out.replace(/\/\/[^\n]*/g, m => m.replace(/[^\n]/g, ' '));
  // Replace import-from statements (including multi-line `import type { ... } from '...'`).
  out = out.replace(/^\s*import\b[\s\S]*?from\s*['"][^'"]+['"];?/gm, m => m.replace(/[^\n]/g, ' '));
  return out;
}

for (const file of collectTypeFiles(componentsDir)) {
  const src = readFileSync(file, 'utf8');
  const scan = stripIgnored(src);
  const lines = src.split('\n');
  const rel = file.replace(resolve(scriptDir, '..') + '/', '');

  // 1. Intersection check (line-level, on the stripped source)
  scan.split('\n').forEach((line, idx) => {
    if (intersectionRegex.test(line)) {
      errors.push(`${rel}:${idx + 1}  uses '& SparXxxProps' intersection; use Pick<SparXxxProps, ...> instead`);
    }
  });

  // 2. Bare references to Spar...Props (not wrapped in Pick<>)
  let match;
  const sparTypeAllRegex = /\bSpar[A-Z]\w*Props\b/g;
  while ((match = sparTypeAllRegex.exec(scan)) !== null) {
    const pos = match.index;
    let depth = 0;
    let wrapper = null;
    for (let i = pos - 1; i >= 0; i--) {
      const ch = scan[i];
      if (ch === '>') depth++;
      else if (ch === '<') {
        if (depth === 0) {
          let j = i - 1;
          while (j >= 0 && /\s/.test(scan[j])) j--;
          const end = j + 1;
          while (j >= 0 && /[A-Za-z_]/.test(scan[j])) j--;
          wrapper = scan.slice(j + 1, end);
          break;
        }
        depth--;
      }
    }
    if (wrapper !== 'Pick') {
      const line = scan.slice(0, pos).split('\n').length;
      errors.push(`${rel}:${line}  references ${match[0]} outside a Pick<> clause (wrapper='${wrapper ?? 'none'}')`);
    }
  }

  // 3. Intent-comment check: every Pick<Spar...Props, ...> should have a
  // comment on the immediately preceding non-empty line. Run on `scan` so
  // that example Pick<> mentions inside generator/comment blocks don't count.
  pickWithSparRegex.lastIndex = 0;
  while ((match = pickWithSparRegex.exec(scan)) !== null) {
    const pos = match.index;
    const lineNo = scan.slice(0, pos).split('\n').length;
    // Find the previous non-empty line.
    let prev = lineNo - 2;
    while (prev >= 0 && lines[prev].trim() === '') prev--;
    if (prev < 0) {
      warnings.push(`${rel}:${lineNo}  Pick<${match[0].slice(5).replace(/[\s<].*/, '')}> has no intent comment above it`);
      continue;
    }
    const prevLine = lines[prev].trim();
    if (!prevLine.startsWith('//') && !prevLine.startsWith('*') && !prevLine.startsWith('/*')) {
      warnings.push(`${rel}:${lineNo}  Pick<Spar...Props> is missing an intent comment on the preceding line`);
    }
  }
}

if (warnings.length) {
  console.warn('Pick<> intent-comment warnings:');
  for (const w of warnings) console.warn(`  ${w}`);
  console.warn('');
}

if (errors.length) {
  console.error('Spar prop type guard FAILED:');
  for (const e of errors) console.error(`  ${e}`);
  console.error('');
  console.error('Wrapper types must consume Spar prop types only via Pick<SparXxxProps, ...>.');
  console.error('See docs/component-authoring-contract.md#public-type-boundary');
  process.exit(1);
}

console.log(`Spar prop type guard passed (${collectTypeFiles(componentsDir).length} files scanned, ${warnings.length} warnings).`);
