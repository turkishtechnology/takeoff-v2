/**
 * Validate generated token output.
 * Compares CSS variable declarations (name + value pairs),
 * ignoring comments, whitespace, and formatting differences.
 *
 * Usage: node scripts/validate-tokens.mjs [--accept-baseline]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVariableBaselineReport, writeVariableBaseline } from './version-baseline.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST_DIR = resolve(ROOT, 'dist');
const TAILWIND_OUTPUT = JSON.parse(readFileSync(resolve(__dirname, 'tailwind-output.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// Log helpers — ANSI colors, no dependencies
// ---------------------------------------------------------------------------

const color = process.stdout.isTTY
  ? { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' }
  : { red: '', green: '', yellow: '', cyan: '', reset: '' };

const PASS = `${color.green}[PASS]${color.reset}`;
const FAIL = `${color.red}[FAIL]${color.reset}`;
const WARN = `${color.yellow}[WARN]${color.reset}`;
const INFO = `${color.cyan}[INFO]${color.reset}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract CSS custom property declarations from SCSS text.
 * Returns Map<name, value> where both are trimmed.
 */
function extractCSSVars(scss) {
  const vars = new Map();
  const regex = /--([\w-]+)\s*:\s*((?:[^;]|\n)*?)\s*;/g;
  let m;
  while ((m = regex.exec(scss)) !== null) {
    const name = m[1].trim();
    const value = m[2].replace(/\s+/g, ' ').trim();
    vars.set(name, value);
  }
  return vars;
}

/**
 * Extract JS module.exports entries.
 * Returns Map<key, value> from module.exports = { 'key': 'value', ... }
 */
function extractJSModule(js) {
  const entries = new Map();
  const regex = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = regex.exec(js)) !== null) {
    entries.set(m[1], m[2]);
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

const acceptBaseline = process.argv.includes('--accept-baseline');
let allPassed = true;

// 1. _variables.scss — check :root block exists and is non-empty
console.log('=== Validating _variables.scss ===');

const scssPath = resolve(DIST_DIR, 'scss/_variables.scss');
if (!existsSync(scssPath)) {
  console.log(`${FAIL} dist/scss/_variables.scss not found — run build first`);
  process.exit(1);
}

const generatedScss = readFileSync(scssPath, 'utf-8');
const genRootMatch = generatedScss.match(/:root\s*\{([\s\S]*?)\n\}/);
const genDarkMatch = generatedScss.match(/\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/);

if (genRootMatch) {
  const genRoot = extractCSSVars(genRootMatch[1]);
  console.log(`\n:root block: ${genRoot.size} tokens`);
  if (genRoot.size === 0) {
    console.log(`  ${FAIL} :root block is empty`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} :root block has tokens`);
  }
} else {
  console.log(`  ${FAIL} :root block not found`);
  allPassed = false;
}

if (genDarkMatch) {
  const genDark = extractCSSVars(genDarkMatch[1]);
  console.log(`\n[data-theme='dark'] block: ${genDark.size} tokens`);
  if (genDark.size === 0) {
    console.log(`  ${FAIL} [data-theme='dark'] block is empty`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} [data-theme='dark'] block has tokens`);
  }
} else {
  console.log(`  ${FAIL} [data-theme='dark'] block not found`);
  allPassed = false;
}

// 2. Tailwind theme files — check they exist and have entries
console.log('\n=== Validating Tailwind theme files ===');

const twFiles = Object.values(TAILWIND_OUTPUT.v3ThemeFiles);
for (const f of twFiles) {
  const genPath = resolve(DIST_DIR, `tailwind/${f}`);
  if (!existsSync(genPath)) {
    console.log(`\n${f}: ${FAIL} Generated file not found`);
    allPassed = false;
    continue;
  }
  const genEntries = extractJSModule(readFileSync(genPath, 'utf-8'));
  console.log(`\n${f}: ${genEntries.size} entries`);
  if (genEntries.size === 0) {
    console.log(`  ${FAIL} No entries found`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} Has entries`);
  }
}

// 3. Typography
const typoPath = resolve(DIST_DIR, `tailwind/${TAILWIND_OUTPUT.v3ComponentFiles.typography}`);
if (existsSync(typoPath)) {
  const typoContent = readFileSync(typoPath, 'utf-8');
  const classCount = (typoContent.match(/'\.\w/g) || []).length;
  console.log(`\ntypography.js: ${classCount} component classes`);
  if (classCount === 0) {
    console.log(`  ${FAIL} No component classes found`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} Has component classes`);
  }
} else {
  console.log(`\ntypography.js: ${FAIL} Not found`);
  allPassed = false;
}

// 4. Light/dark semantic token symmetry
console.log('\n=== Validating light/dark token symmetry ===');

const TOKENS_DIR = resolve(ROOT, 'tokens');
const lightPath = resolve(TOKENS_DIR, 'semantic/light.json');
const darkPath = resolve(TOKENS_DIR, 'semantic/dark.json');

if (existsSync(lightPath) && existsSync(darkPath)) {
  const lightJSON = JSON.parse(readFileSync(lightPath, 'utf-8'));
  const darkJSON = JSON.parse(readFileSync(darkPath, 'utf-8'));

  // DTCG tree walker: collect dot-joined paths for every leaf ($value-bearing node),
  // skipping DTCG meta keys ($type, $description, $extensions, etc.).
  function collectLeafPaths(node, prefix = []) {
    const paths = [];
    if (!node || typeof node !== 'object') return paths;
    if ('$value' in node) return [prefix.join('.')];
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      paths.push(...collectLeafPaths(child, [...prefix, key]));
    }
    return paths;
  }

  const lightKeys = collectLeafPaths(lightJSON.semantic || {}).sort();
  const darkKeys = collectLeafPaths(darkJSON.semantic || {}).sort();

  const missingInDark = lightKeys.filter(k => !darkKeys.includes(k));
  const missingInLight = darkKeys.filter(k => !lightKeys.includes(k));

  if (missingInDark.length > 0) {
    console.log(`  ${FAIL} ${missingInDark.length} token(s) in light.json missing from dark.json:`);
    for (const k of missingInDark.slice(0, 10)) console.log(`     - ${k}`);
    if (missingInDark.length > 10) console.log(`     ... and ${missingInDark.length - 10} more`);
    allPassed = false;
  }

  if (missingInLight.length > 0) {
    console.log(`  ${FAIL} ${missingInLight.length} token(s) in dark.json missing from light.json:`);
    for (const k of missingInLight.slice(0, 10)) console.log(`     - ${k}`);
    if (missingInLight.length > 10) console.log(`     ... and ${missingInLight.length - 10} more`);
    allPassed = false;
  }

  if (missingInDark.length === 0 && missingInLight.length === 0) {
    console.log(`  ${PASS} ${lightKeys.length} tokens symmetric between light and dark`);
  }
} else {
  console.log(`  ${WARN} semantic/light.json or dark.json not found — skipping`);
}

// 5. Tailwind v4 theme.css validation
console.log('\n=== Validating Tailwind v4 outputs ===');

const twThemePath = resolve(DIST_DIR, `tailwind/${TAILWIND_OUTPUT.v4ThemeFile}`);
if (existsSync(twThemePath)) {
  const twTheme = readFileSync(twThemePath, 'utf-8');
  const colorCount = (twTheme.match(/--color-/g) || []).length;
  const spacingCount = (twTheme.match(/--spacing-/g) || []).length;
  console.log(`\ntheme.css: ${colorCount} colors, ${spacingCount} spacing tokens`);
  if (colorCount === 0) {
    console.log(`  ${FAIL} No color tokens found`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} Has color tokens`);
  }
} else {
  console.log(`\ntheme.css: ${FAIL} Not found`);
  allPassed = false;
}

const twCompPath = resolve(DIST_DIR, `tailwind/${TAILWIND_OUTPUT.v4ComponentFile}`);
if (existsSync(twCompPath)) {
  const twComp = readFileSync(twCompPath, 'utf-8');
  const classCount = (twComp.match(/\.\w/g) || []).length;
  console.log(`\n_components.css: ${classCount} component classes`);
  if (classCount === 0) {
    console.log(`  ${FAIL} No component classes found`);
    allPassed = false;
  } else {
    console.log(`  ${PASS} Has component classes`);
  }
} else {
  console.log(`\n_components.css: ${FAIL} Not found`);
  allPassed = false;
}

// 6. Breaking change detection
console.log('\n=== Breaking change detection ===');

const CACHE_DIR = resolve(ROOT, '.cache');
const PREV_VARS_PATH = resolve(CACHE_DIR, 'previous-variables.txt');

/** Extract all CSS variable names from a file */
function extractVarNames(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const names = new Set();
  const regex = /\s+--([\w-]+)\s*:/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    names.add(`--${m[1]}`);
  }
  return [...names].sort();
}

if (existsSync(scssPath)) {
  const currentVars = extractVarNames(scssPath);

  if (existsSync(PREV_VARS_PATH)) {
    const previousVars = readFileSync(PREV_VARS_PATH, 'utf-8').split('\n').filter(Boolean);

    const baselineReport = getVariableBaselineReport(currentVars, previousVars, { acceptBaseline });

    if (baselineReport.removed.length > 0) {
      if (baselineReport.passed) {
        console.log(`  ${INFO} Accepted ${baselineReport.removed.length} removed variable(s) into the baseline`);
      } else {
        console.log(`  ${FAIL} BREAKING: ${baselineReport.removed.length} variable(s) removed (requires MAJOR version bump):`);
        for (const v of baselineReport.removed.slice(0, 20)) console.log(`     - ${v}`);
        if (baselineReport.removed.length > 20) console.log(`     ... and ${baselineReport.removed.length - 20} more`);
        allPassed = false;
      }
    } else {
      console.log(`  ${PASS} No variables removed (${currentVars.length} current, ${previousVars.length} previous)`);
      if (baselineReport.added.length > 0) {
        console.log(`  ${INFO} ${baselineReport.added.length} new variable(s) added (MINOR bump)`);
      }
    }
  } else {
    const baselineAction = acceptBaseline ? 'creating initial snapshot' : 'run with --accept-baseline to create one';
    console.log(`  ${WARN} No previous baseline found — ${baselineAction}`);
  }

  if (acceptBaseline) {
    writeVariableBaseline(PREV_VARS_PATH, currentVars);
    console.log(`  ${INFO} Saved ${currentVars.length} variables to .cache/previous-variables.txt`);
  } else {
    console.log(`  ${INFO} Baseline unchanged`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log(`${PASS} All validations passed!`);
} else {
  console.log(`${FAIL} Some validations failed — review differences above.`);
  process.exit(1);
}
