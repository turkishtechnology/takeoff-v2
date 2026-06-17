/**
 * Figma → Token Sync Script
 *
 * Reads the DTCG JSON exported by the Takeoff Token Exporter Figma plugin
 * and generates our token file structure.
 *
 * Usage: node scripts/sync-figma.mjs <path-to-figma-export.json>
 *
 * Mapping:
 *   Figma Collection/Mode           → Our File
 *   ─────────────────────────────────────────────────
 *   primitive-colors/thy            → primitives/default/color/*.json
 *   primitive-colors/{brand}        → primitives/brands/{brand}/color/*.json (diffs only)
 *   typography/Geologica            → primitives/default/typography/*.json
 *   typography/{brandFont}          → primitives/brands/{brand}/typography/family.json (diffs only)
 *   typography-line-height/*        → primitives/default/typography/line-height.json
 *   semantic-colors/Light           → semantic/light.json
 *   semantic-colors/Dark            → semantic/dark.json
 *   spacing/Mode 1                  → primitives/default/spacing.json
 *   radius/value                    → primitives/default/radius.json
 *   semantic-typography/Desktop     → responsive/desktop.json
 *   semantic-typography/Tablet      → responsive/tablet.json
 *   semantic-typography/Mobile      → responsive/mobile.json
 *   {component}/Mode 1              → component/{component}.json
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = resolve(__dirname, '..', 'tokens');

// ---------------------------------------------------------------------------
// Config — loaded from sync-config.json (collection mappings externalized)
// ---------------------------------------------------------------------------

const syncConfig = JSON.parse(readFileSync(resolve(__dirname, 'sync-config.json'), 'utf-8'));

const DEFAULT_BRAND = syncConfig.defaultBrand;
const TYPO_MODE_TO_BRAND = syncConfig.typoModeToBrand;
const WEIGHT_MAP = syncConfig.weightMap;
const RESPONSIVE_MODES = syncConfig.responsiveModes;
const COMPONENT_COLLECTIONS = syncConfig.componentCollections;
const COMPONENT_NAME_MAP = syncConfig.componentNameMap;

// ---------------------------------------------------------------------------
// Deploy paths — configurable via env, defaults for backward compatibility
// ---------------------------------------------------------------------------

const TAKEOFF_UI_PATH = process.env.TAKEOFF_UI_PATH || resolve(__dirname, '..', '..', '..', 'takeoff-ui');
const TAKEOFF_SPAR_PATH = process.env.TAKEOFF_SPAR_PATH || resolve(__dirname, '..', '..', '..', 'takeoff-spar');

// ---------------------------------------------------------------------------
// Security — API key validation for sync requests
// ---------------------------------------------------------------------------

/**
 * Validate the API key from request headers (when used as part of an HTTP sync flow).
 * If FIGMA_SYNC_API_KEY env var is not set, security check is skipped (dev mode).
 * Returns { ok: boolean, status?: number, message?: string }
 */
function validateApiKey(headers) {
  const expectedKey = process.env.FIGMA_SYNC_API_KEY;
  if (!expectedKey) {
    // Dev mode — no key configured, skip security check
    return { ok: true };
  }

  const providedKey = headers?.['x-api-key'] || headers?.['authorization']?.replace(/^Bearer\s+/i, '');
  if (!providedKey || providedKey !== expectedKey) {
    return { ok: false, status: 401, message: 'Unauthorized: invalid or missing API key' };
  }

  return { ok: true };
}

export { validateApiKey };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLeafTokens(obj, prefix = '') {
  const tokens = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}/${k}` : k;
    if (v && typeof v === 'object') {
      if ('$value' in v) {
        tokens[path] = v;
      } else {
        Object.assign(tokens, getLeafTokens(v, path));
      }
    }
  }
  return tokens;
}

function writeJSON(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Transform Figma reference to our reference format.
 * Figma: {primary.500} → Ours: {base.color.primary.500}
 * Figma: {family.body} → Ours: {base.typography.family.body}
 * Figma: {spacing.xl} → Ours: {base.spacing.xl}
 * Figma: {radius.s} → Ours: {base.radius.s}
 */
function transformRef(figmaRef, context) {
  if (typeof figmaRef !== 'string' || !figmaRef.startsWith('{') || !figmaRef.endsWith('}')) {
    return figmaRef;
  }
  const inner = figmaRef.slice(1, -1);
  const parts = inner.split('.');

  // Semantic color references → primitive colors
  if (context === 'semantic-color') {
    // {primary.500} → {base.color.primary.500}
    // {neutral.50} → {base.color.neutral.50}
    // {static.black} → {base.color.static.black}
    // {alpha.base.black-8} → {base.color.alpha.alpha-base-black-8}
    // {alpha.brand.primary-500-8} → {base.color.alpha.alpha-brand-primary-500-8}
    if (parts[0] === 'alpha') {
      // Alpha tokens: the leaf name in our system includes "alpha-" prefix
      const alphaName = 'alpha-' + parts.slice(1).join('-');
      return `{base.color.alpha.${alphaName}}`;
    }
    return `{base.color.${inner}}`;
  }

  // Responsive typography references → typography primitives
  if (context === 'responsive-typo') {
    // {family.body} → {base.typography.family.body}
    // {weight.medium} → {base.typography.weight.medium}
    // {size.2xl} → {base.typography.size.2xl}
    if (parts[0] === 'family' || parts[0] === 'weight' || parts[0] === 'size') {
      return `{base.typography.${inner}}`;
    }
    // {line-height.sm.normal} → {base.typography.line-height.sm-normal}
    // (explicit reference with mode name)
    if (parts[0] === 'line-height' && parts.length === 3) {
      return `{base.typography.line-height.${parts[1]}-${parts[2]}}`;
    }
    // {2xl} → line-height reference (default "normal" mode)
    // → {base.typography.line-height.2xl-normal}
    if (parts.length === 1) {
      return `{base.typography.line-height.${parts[0]}-normal}`;
    }
    return `{base.typography.${inner}}`;
  }

  // Component references → spacing/radius
  if (context === 'component') {
    // {spacing.xl} → {base.spacing.xl}
    if (parts[0] === 'spacing') return `{base.spacing.${parts.slice(1).join('.')}}`;
    // {radius.s} → {base.radius.s}
    if (parts[0] === 'radius') return `{base.radius.${parts.slice(1).join('.')}}`;
    return `{base.${inner}}`;
  }

  return figmaRef;
}

/**
 * Convert Figma token name path (with /) to our flat key name (with -)
 * e.g. "primary/lightest" → "primary-lightest"
 *      "states/info/base" → "states-info-base"
 */
function flattenName(figmaPath) {
  return figmaPath.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
}

// ---------------------------------------------------------------------------
// Sync: Primitive Colors
// ---------------------------------------------------------------------------

function syncPrimitiveColors(figmaData) {
  const defaultTokens = getLeafTokens(figmaData[`primitive-colors/${DEFAULT_BRAND}`] || {});

  // Group tokens by color group
  function groupByColor(tokens) {
    const groups = {};
    for (const [path, val] of Object.entries(tokens)) {
      const parts = path.split('/');
      const group = parts[0]; // e.g. "primary", "alpha", "aviation"
      if (!groups[group]) groups[group] = {};

      // Build the leaf key
      const leafKey = parts.slice(1).join('-');
      groups[group][leafKey] = val;
    }
    return groups;
  }

  // Write default brand files
  const defaultGroups = groupByColor(defaultTokens);
  for (const [group, tokens] of Object.entries(defaultGroups)) {
    // Map group name to file name
    const fileName = group === 'aviation' ? 'aviation-amber' : group;
    const jsonRoot = group === 'aviation' ? 'aviation-amber' : group;

    const fileData = { [jsonRoot]: {} };

    fileData[jsonRoot].$type = 'color';
    if (group === 'alpha') {
      // Alpha leaves already carry their fully-qualified name (e.g. `alpha-base-black-16`).
      for (const [leafKey, val] of Object.entries(tokens)) {
        fileData[jsonRoot][`alpha-${leafKey}`] = { $value: val.$value };
      }
    } else {
      for (const [shade, val] of Object.entries(tokens)) {
        fileData[jsonRoot][shade] = { $value: val.$value };
      }
    }

    const filePath = resolve(TOKENS_DIR, 'primitives/default/color', `${fileName}.json`);
    writeJSON(filePath, fileData);
  }

  // Write brand override files (only diffs)
  const brands = Object.keys(figmaData)
    .filter(k => k.startsWith('primitive-colors/') && !k.endsWith(`/${DEFAULT_BRAND}`))
    .map(k => k.split('/')[1]);

  for (const brand of brands) {
    const brandTokens = getLeafTokens(figmaData[`primitive-colors/${brand}`] || {});
    const brandGroups = groupByColor(brandTokens);
    for (const [group, tokens] of Object.entries(brandGroups)) {
      const defaultGroup = defaultGroups[group] || {};

      // Find differences
      const diffs = {};
      for (const [key, val] of Object.entries(tokens)) {
        const defaultVal = defaultGroup[key];
        if (!defaultVal || String(defaultVal.$value) !== String(val.$value)) {
          diffs[key] = val;
        }
      }

      if (Object.keys(diffs).length === 0) continue;

      const fileName = group === 'aviation' ? 'aviation-amber' : group;
      const jsonRoot = group === 'aviation' ? 'aviation-amber' : group;
      const brandDir = brand.toLowerCase();

      const fileData = { [jsonRoot]: { $type: 'color' } };
      if (group === 'alpha') {
        for (const [leafKey, val] of Object.entries(diffs)) {
          fileData[jsonRoot][`alpha-${leafKey}`] = { $value: val.$value };
        }
      } else {
        for (const [shade, val] of Object.entries(diffs)) {
          fileData[jsonRoot][shade] = { $value: val.$value };
        }
      }

      const filePath = resolve(TOKENS_DIR, `primitives/brands/${brandDir}/color`, `${fileName}.json`);
      writeJSON(filePath, fileData);
    }
  }
}

// ---------------------------------------------------------------------------
// Sync: Typography
// ---------------------------------------------------------------------------

function syncTypography(figmaData) {
  const defaultTypoMode = Object.keys(TYPO_MODE_TO_BRAND).find(k => TYPO_MODE_TO_BRAND[k] === DEFAULT_BRAND);
  const resolvedDefaultTypoMode = defaultTypoMode === 'Geologica' ? 'TK' : defaultTypoMode;
  const defaultTypo = getLeafTokens(figmaData[`typography/${resolvedDefaultTypoMode}`] || {});

  // Family
  const familyData = { family: {} };
  // Size
  const sizeData = { size: { $type: 'dimension' } };
  // Weight
  const weightData = { weight: { $type: 'fontWeight' } };

  for (const [path, val] of Object.entries(defaultTypo)) {
    const parts = path.split('/');
    const category = parts[0]; // family, size, weight, line-height

    if (category === 'family') {
      familyData.family[parts[1]] = { $value: val.$value };
    } else if (category === 'size') {
      sizeData.size[parts[1]] = { $value: `${val.$value}px` };
    } else if (category === 'weight') {
      const numericWeight = WEIGHT_MAP[val.$value] || val.$value;
      weightData.weight[parts[1]] = { $value: numericWeight };
    }
    // line-height handled separately via typography-line-height collection
  }

  writeJSON(resolve(TOKENS_DIR, 'primitives/default/typography/family.json'), familyData);
  writeJSON(resolve(TOKENS_DIR, 'primitives/default/typography/size.json'), sizeData);
  writeJSON(resolve(TOKENS_DIR, 'primitives/default/typography/weight.json'), weightData);

  // Line-height from typography-line-height collection
  const lineHeightData = { 'line-height': {} };

  for (const mode of ['normal', 'tight', 'none']) {
    const lhTokens = getLeafTokens(figmaData[`typography-line-height/${mode}`] || {});
    for (const [path, val] of Object.entries(lhTokens)) {
      const size = path; // e.g. "2xl", "base", "xxs"

      // Dimensional variant: size-mode (e.g. "xxs-normal")
      const dimName = `${size}-${mode}`;
      lineHeightData['line-height'][dimName] = {
        $value: `${val.$value}px`,
        $type: 'dimension',
      };

      // Unitless variant: mode-size (e.g. "normal-xxs")
      const unitlessName = `${mode}-${size}`;
      lineHeightData['line-height'][unitlessName] = {
        $value: val.$value,
        $type: 'number',
      };
    }
  }

  writeJSON(resolve(TOKENS_DIR, 'primitives/default/typography/line-height.json'), lineHeightData);

  // Brand typography overrides (only font families differ)
  for (const [typoMode, brand] of Object.entries(TYPO_MODE_TO_BRAND)) {
    if (brand === DEFAULT_BRAND) continue;

    const brandTypo = getLeafTokens(figmaData[`typography/${typoMode}`] || {});
    const defaultFamilies = {};
    const brandFamilies = {};

    for (const [path, val] of Object.entries(defaultTypo)) {
      if (path.startsWith('family/')) defaultFamilies[path.split('/')[1]] = val.$value;
    }
    for (const [path, val] of Object.entries(brandTypo)) {
      if (path.startsWith('family/')) brandFamilies[path.split('/')[1]] = val.$value;
    }

    // Only write if families differ
    const diffs = {};
    for (const [key, val] of Object.entries(brandFamilies)) {
      if (defaultFamilies[key] !== val) diffs[key] = val;
    }

    if (Object.keys(diffs).length > 0) {
      const brandFamilyData = { family: {} };
      for (const [key, val] of Object.entries(diffs)) {
        brandFamilyData.family[key] = { $value: val };
      }
      writeJSON(resolve(TOKENS_DIR, `primitives/brands/${brand}/typography/family.json`), brandFamilyData);
    }
  }
}

// ---------------------------------------------------------------------------
// Sync: Spacing & Radius
// ---------------------------------------------------------------------------

function syncSpacing(figmaData) {
  const spacingTokens = getLeafTokens(figmaData['spacing/Mode 1'] || {});
  const spacingData = { spacing: { $type: 'dimension' } };

  for (const [path, val] of Object.entries(spacingTokens)) {
    const key = path.replace('spacing/', '');
    spacingData.spacing[key] = { $value: `${val.$value}px` };
  }
  writeJSON(resolve(TOKENS_DIR, 'primitives/default/spacing.json'), spacingData);

  const radiusTokens = getLeafTokens(figmaData['radius/value'] || {});
  const radiusData = { radius: { $type: 'dimension' } };

  for (const [path, val] of Object.entries(radiusTokens)) {
    const key = path.replace('radius/', '');
    radiusData.radius[key] = { $value: `${val.$value}px` };
  }
  writeJSON(resolve(TOKENS_DIR, 'primitives/default/radius.json'), radiusData);
}

// ---------------------------------------------------------------------------
// Sync: Semantic Colors
// ---------------------------------------------------------------------------

function syncSemanticColors(figmaData) {
  for (const scheme of ['Light', 'Dark']) {
    const tokens = getLeafTokens(figmaData[`semantic-colors/${scheme}`] || {});
    // DTCG §Inheritance: $type declared once at the `semantic` group,
    // inherited by all descendants. Tree is nested by Figma path segments.
    const semanticData = { semantic: { $type: 'color' } };

    for (const [path, val] of Object.entries(tokens)) {
      const segments = path.split('/').map(s => s.trim().toLowerCase().replace(/\s+/g, '-'));
      const value = val.$value;
      const resolved = typeof value === 'string' && value.startsWith('{') ? transformRef(value, 'semantic-color') : value;

      let cursor = semanticData.semantic;
      for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (!cursor[seg] || typeof cursor[seg] !== 'object' || '$value' in cursor[seg]) {
          cursor[seg] = {};
        }
        cursor = cursor[seg];
      }
      cursor[segments[segments.length - 1]] = { $value: resolved };
    }

    const fileName = scheme.toLowerCase();
    writeJSON(resolve(TOKENS_DIR, `semantic/${fileName}.json`), semanticData);
  }
}

// ---------------------------------------------------------------------------
// Sync: Responsive Typography
// ---------------------------------------------------------------------------

function syncResponsiveTypography(figmaData) {
  for (const [figmaMode, ourName] of Object.entries(RESPONSIVE_MODES)) {
    const tokens = getLeafTokens(figmaData[`semantic-typography/${figmaMode}`] || {});
    const responsiveData = { responsive: { [ourName]: { $type: 'typography' } } };

    for (const [path, val] of Object.entries(tokens)) {
      // path: "body/2xl/font", "title/h1/size", etc.
      const key = flattenName(path);
      const value = val.$value;

      if (typeof value === 'string' && value.startsWith('{')) {
        responsiveData.responsive[ourName][key] = {
          $value: transformRef(value, 'responsive-typo'),
        };
      } else {
        responsiveData.responsive[ourName][key] = {
          $value: value,
        };
      }
    }

    writeJSON(resolve(TOKENS_DIR, `responsive/${ourName}.json`), responsiveData);
  }
}

// ---------------------------------------------------------------------------
// Sync: Component Tokens
// ---------------------------------------------------------------------------

function syncComponents(figmaData) {
  for (const collection of COMPONENT_COLLECTIONS) {
    // Find the mode (usually "Mode 1" or "base")
    const modeKey = Object.keys(figmaData).find(k => k.startsWith(`${collection}/`));
    if (!modeKey) continue;

    const tokens = getLeafTokens(figmaData[modeKey] || {});
    if (Object.keys(tokens).length === 0) continue;

    const compName = COMPONENT_NAME_MAP[collection] || collection.toLowerCase().replace(/\s+/g, '-');
    const componentData = { component: { [compName]: { $type: 'dimension' } } };

    for (const [path, val] of Object.entries(tokens)) {
      const key = flattenName(path);
      const value = val.$value;

      if (typeof value === 'string' && value.startsWith('{')) {
        componentData.component[compName][key] = {
          $value: transformRef(value, 'component'),
        };
      } else if (typeof value === 'number') {
        componentData.component[compName][key] = {
          $value: `${value}px`,
        };
      } else {
        componentData.component[compName][key] = {
          $value: value,
        };
      }
    }

    writeJSON(resolve(TOKENS_DIR, `component/${compName}.json`), componentData);
  }
}

// ---------------------------------------------------------------------------
// Sync: Breakpoints (shared, not from Figma — kept as-is)
// ---------------------------------------------------------------------------

// Breakpoints are not in Figma variables; they stay in primitives/shared/breakpoint.json

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const inputPath = process.argv.filter(a => a !== '--')[2];
if (!inputPath) {
  console.error('Usage: node scripts/sync-figma.mjs <path-to-figma-export.json>');
  process.exit(1);
}

const figmaData = JSON.parse(readFileSync(resolve(process.cwd(), inputPath), 'utf-8'));

syncPrimitiveColors(figmaData);
syncTypography(figmaData);
syncSpacing(figmaData);
syncSemanticColors(figmaData);
syncResponsiveTypography(figmaData);
syncComponents(figmaData);

// Clean up ephemeral Figma export
unlinkSync(resolve(process.cwd(), inputPath));

console.log('Figma sync complete');
console.log(`Deploy paths: UI=${TAKEOFF_UI_PATH}, SPAR=${TAKEOFF_SPAR_PATH}`);

// ---------------------------------------------------------------------------
// Post-sync validation — run validate-tokens automatically
// ---------------------------------------------------------------------------

try {
  console.log('\nRunning post-sync token validation...');
  execSync('node scripts/validate-tokens.mjs', {
    cwd: resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('Post-sync validation passed.');
} catch {
  console.warn('\n[WARN] Post-sync validation failed — review the output above.');
  console.warn('[WARN] This is a warning only; the sync itself completed successfully.');
}
