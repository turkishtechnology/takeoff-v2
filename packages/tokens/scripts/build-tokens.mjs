/**
 * Build script: Uses Style Dictionary v4 to process DTCG JSON tokens and generate:
 * 1. _variables.scss — CSS custom properties (:root + [data-theme='dark'])
 * 2. Tailwind theme JS files (colors.js, spacing.js, radius.js, effects.js, screens.js)
 * 3. typography.js — Tailwind addComponents plugin for responsive typography
 *
 * Supports multi-brand builds via override files in primitives/brands/{brand}/
 */

import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS_DIR = resolve(ROOT, 'tokens');
const DIST_DIR = resolve(ROOT, 'dist');
const TMP_DIR = resolve(DIST_DIR, '.tmp');
const TAILWIND_OUTPUT = JSON.parse(readFileSync(resolve(__dirname, 'tailwind-output.json'), 'utf-8'));

const HEADER = '/* @takeoff-design/tokens — auto-generated, do not edit */';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJSON(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

function readDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !('$value' in source[key])) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ---------------------------------------------------------------------------
// Token Tree Builder
// ---------------------------------------------------------------------------

const COLOR_FILE_ORDER = [
  'primary.json',
  'static.json',
  'secondary.json',
  'neutral.json',
  'red.json',
  'blue.json',
  'green.json',
  'yellow.json',
  'purple.json',
  'cyan.json',
  'business.json',
  'teal.json',
  'alpha.json',
  'aviation-amber.json',
];

function getOrderedColorFiles() {
  const allFiles = readDir(resolve(TOKENS_DIR, 'primitives/default/color'));
  const ordered = COLOR_FILE_ORDER.filter(f => allFiles.includes(f));
  for (const f of allFiles) {
    if (!ordered.includes(f)) ordered.push(f);
  }
  return ordered;
}

/**
 * Build the merged DTCG token tree for a brand + scheme combination.
 * Wraps primitives under base.color / base.typography / base.spacing / base.radius
 * so that DTCG references like {base.color.primary.50} resolve correctly.
 */
function buildTokenTree(brand, scheme) {
  const tree = {};

  // 1. Shared primitives (breakpoint — not wrapped under base)
  const sharedDir = resolve(TOKENS_DIR, 'primitives/shared');
  for (const f of readDir(sharedDir)) {
    deepMerge(tree, readJSON(resolve(sharedDir, f)));
  }

  // 2. Default color primitives (ordered for consistent output)
  for (const f of getOrderedColorFiles()) {
    const data = readJSON(resolve(TOKENS_DIR, 'primitives/default/color', f));
    deepMerge(tree, { base: { color: data } });
  }

  // 3. Default typography primitives
  for (const f of readDir(resolve(TOKENS_DIR, 'primitives/default/typography'))) {
    const data = readJSON(resolve(TOKENS_DIR, 'primitives/default/typography', f));
    deepMerge(tree, { base: { typography: data } });
  }

  // 4. Default spacing & radius
  deepMerge(tree, { base: readJSON(resolve(TOKENS_DIR, 'primitives/default/spacing.json')) });
  deepMerge(tree, { base: readJSON(resolve(TOKENS_DIR, 'primitives/default/radius.json')) });

  // 5. Brand overrides (merge on top of defaults)
  if (brand !== 'default') {
    const brandDir = resolve(TOKENS_DIR, 'primitives/brands', brand);
    if (existsSync(brandDir)) {
      const brandColorDir = resolve(brandDir, 'color');
      for (const f of readDir(brandColorDir)) {
        deepMerge(tree, { base: { color: readJSON(resolve(brandColorDir, f)) } });
      }
      const brandTypoDir = resolve(brandDir, 'typography');
      for (const f of readDir(brandTypoDir)) {
        deepMerge(tree, { base: { typography: readJSON(resolve(brandTypoDir, f)) } });
      }
      const brandSpacing = resolve(brandDir, 'spacing.json');
      if (existsSync(brandSpacing)) deepMerge(tree, { base: readJSON(brandSpacing) });
      const brandRadius = resolve(brandDir, 'radius.json');
      if (existsSync(brandRadius)) deepMerge(tree, { base: readJSON(brandRadius) });
    }
  }

  // 6. Semantic tokens (scheme-specific)
  deepMerge(tree, readJSON(resolve(TOKENS_DIR, `semantic/${scheme}.json`)));

  // 7. Effect tokens (scheme-independent, lives under primitives/shared)
  deepMerge(tree, readJSON(resolve(TOKENS_DIR, 'primitives/shared/effect.json')));

  // 8. Component tokens
  for (const f of readDir(resolve(TOKENS_DIR, 'component'))) {
    deepMerge(tree, readJSON(resolve(TOKENS_DIR, 'component', f)));
  }

  // 9. Responsive typography (ordered: desktop, tablet, mobile)
  for (const bp of ['desktop', 'tablet', 'mobile']) {
    const fPath = resolve(TOKENS_DIR, `responsive/${bp}.json`);
    if (existsSync(fPath)) deepMerge(tree, readJSON(fPath));
  }

  return tree;
}

// ---------------------------------------------------------------------------
// Style Dictionary v4 — Registrations
// ---------------------------------------------------------------------------

let unresolvedRefCount = 0;

// Custom name transform: maps token paths to CSS variable names
StyleDictionary.registerTransform({
  name: 'name/takeoff',
  type: 'name',
  transform: token => {
    // Sanitize path segments: replace '+' from Figma with '-and-'
    const p = token.path.map(seg => seg.replace(/\+/g, '-and-'));
    // base.color.alpha.* → leaf only (alpha key already in leaf name)
    if (p[0] === 'base' && p[1] === 'color' && p[2] === 'alpha') return p.slice(3).join('-');
    // base.color.{palette}.{shade} → palette-shade
    if (p[0] === 'base' && p[1] === 'color') return p.slice(2).join('-');
    // base.typography.{group}.{key} → group-key
    if (p[0] === 'base' && p[1] === 'typography') return p.slice(2).join('-');
    // base.spacing.{key} → spacing-key
    if (p[0] === 'base' && p[1] === 'spacing') return p.slice(1).join('-');
    // base.radius.{key} → radius-key
    if (p[0] === 'base' && p[1] === 'radius') return p.slice(1).join('-');
    // semantic.{key} → key (strip semantic prefix)
    if (p[0] === 'semantic') return p.slice(1).join('-');
    // effect.{key} → key (strip effect prefix)
    if (p[0] === 'effect') return p.slice(1).join('-');
    // component.{name}.{key} → name-key
    // Figma tokens are inconsistent: some keys include component name, some don't.
    // Also, some Figma collection names differ from our file names (notification→drawer).
    // Strategy: if key already starts with a known component-related prefix, keep it as-is.
    // Otherwise, prepend the component name.
    if (p[0] === 'component') {
      const compName = p[1];
      const key = p.slice(2).join('-');
      // Reverse mapping: our file name → possible Figma key prefixes
      const COMP_KEY_PREFIXES = {
        'drawer': ['notification', 'drawer'],
        'tooltip': ['tooltips', 'tooltip'],
        'radio-checkbox': ['basic-switcher', 'card-switcher', 'avatar-switcher', 'radio-checkbox'],
        'button': ['button', 'fab-button', 'link-button', 'segmented-button'],
      };
      const knownPrefixes = COMP_KEY_PREFIXES[compName] || [compName];
      const hasPrefix = knownPrefixes.some(pfx => key.startsWith(pfx + '-') || key === pfx);
      if (hasPrefix) return key;
      return `${compName}-${key}`;
    }
    // responsive.{bp}.{key} → bp-key (strip responsive prefix)
    if (p[0] === 'responsive') return p.slice(1).join('-');
    // breakpoint.{key} → breakpoint-key
    return p.join('-');
  },
});

StyleDictionary.registerTransformGroup({
  name: 'takeoff',
  transforms: ['name/takeoff'],
});

// Collector format: captures processed tokens for custom output generation
let _collected = null;

StyleDictionary.registerFormat({
  name: 'takeoff/collect',
  format: ({ dictionary }) => {
    // Build a path→name map for reference resolution
    const refMap = new Map();
    for (const t of dictionary.allTokens) {
      refMap.set(t.path.join('.'), t.name);
    }
    _collected = {
      allTokens: dictionary.allTokens,
      refMap,
    };
    return '{}';
  },
});

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function resolveTokenValue(token) {
  const origValue = token.original?.$value;
  if (typeof origValue !== 'string') return String(token.$value);

  // DTCG reference: {path.to.token}
  const refMatch = origValue.match(/^\{(.+)\}$/);
  if (refMatch) {
    const refPath = refMatch[1];
    const cssName = _collected.refMap.get(refPath);
    if (cssName) {
      return `var(--${cssName})`;
    }
    // Unresolved reference — fallback (matches old behavior)
    const parts = refPath.split('.');
    const stripped = parts.filter(p => !['base', 'semantic', 'component', 'responsive', 'color', 'typography'].includes(p));
    unresolvedRefCount++;
    return `var(--${stripped.join('-')})`;
  }

  // Raw value (including effect tokens with embedded CSS var())
  return String(token.$value);
}

function tokenCssValue(token) {
  let value = resolveTokenValue(token);
  if (token.path[0] === 'base' && token.path[1] === 'typography' && token.path[2] === 'family') {
    if (!value.startsWith("'") && !value.startsWith('var(')) {
      value = `'${value}'`;
    }
  }
  return value;
}

function decl(token) {
  return `  --${token.name}: ${tokenCssValue(token)};`;
}

// ---------------------------------------------------------------------------
// SCSS Generation
// ---------------------------------------------------------------------------

function generateLightScss(tokens, selector) {
  const lines = [];

  // 1. Primitive colors
  const colors = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'color');
  lines.push('  /* primitive-colors */');
  for (const t of colors) lines.push(decl(t));

  // 2. Typography (ordered: family, size, weight, line-height — ALL including unitless)
  const typoOrder = ['family', 'size', 'weight', 'line-height'];
  const allTypo = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'typography');
  lines.push('');
  lines.push('  /* typography */');
  for (const group of typoOrder) {
    for (const t of allTypo) {
      if (t.path[2] === group) lines.push(decl(t));
    }
  }

  // 3. Responsive typography (desktop → tablet → mobile)
  const responsive = tokens.filter(t => t.path[0] === 'responsive');
  for (const bp of ['desktop', 'tablet', 'mobile']) {
    const bpTokens = responsive.filter(t => t.path[1] === bp);
    if (bpTokens.length > 0) {
      lines.push('');
      lines.push(`  /* ${bp} */`);
      for (const t of bpTokens) lines.push(decl(t));
    }
  }

  // 4. Unitless line-heights
  const unitlessLH = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'typography' && t.$type === 'number');
  if (unitlessLH.length > 0) {
    lines.push('');
    lines.push('  /* line-heights */');
    for (const t of unitlessLH) lines.push(decl(t));
  }

  // 5. Effects
  const effects = tokens.filter(t => t.path[0] === 'effect');
  lines.push('');
  lines.push('  /* -------------------------- SEMANTICS -------------------------- */');
  for (const t of effects) lines.push(decl(t));

  // 6. Radius
  const radius = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'radius');
  lines.push('');
  lines.push('  /* radius */');
  for (const t of radius) lines.push(decl(t));

  // 7. Spacing
  const spacing = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'spacing');
  lines.push('');
  lines.push('  /* spacing */');
  for (const t of spacing) lines.push(decl(t));

  // 8. Semantic colors
  const semantic = tokens.filter(t => t.path[0] === 'semantic');
  lines.push('');
  lines.push('  /* semantic colors light */');
  for (const t of semantic) lines.push(decl(t));
  lines.push('  /* end of semantic colors light */');

  // 9. Component tokens (grouped by component name)
  const components = tokens.filter(t => t.path[0] === 'component');
  const compGroups = {};
  for (const t of components) {
    const group = t.path[1];
    if (!compGroups[group]) compGroups[group] = [];
    compGroups[group].push(t);
  }
  for (const [group, groupTokens] of Object.entries(compGroups)) {
    lines.push('');
    lines.push(`  /* ------ ${group} variables ------ */`);
    for (const t of groupTokens) lines.push(decl(t));
  }

  // 10. Breakpoints
  const breakpoints = tokens.filter(t => t.path[0] === 'breakpoint');
  lines.push('');
  for (const t of breakpoints) lines.push(decl(t));

  return `${selector} {\n${lines.join('\n')}\n}`;
}

function generateDarkScss(tokens, selector) {
  // Only semantic + component color tokens
  const darkTokens = tokens.filter(t => t.path[0] === 'semantic' || (t.path[0] === 'component' && t.$type === 'color'));
  const lines = [];
  lines.push('  /* semantic colors dark */');
  for (const t of darkTokens) lines.push(decl(t));
  lines.push('  /* end of semantic colors dark */');
  return `${selector} {\n${lines.join('\n')}\n}`;
}

// ---------------------------------------------------------------------------
// Tailwind Module Generation
// ---------------------------------------------------------------------------

function writeTWModule(fileName, entries, options = {}) {
  const lines = entries.map(([key, val]) => {
    const property = options.quoteKeys === false && /^[$A-Z_a-z][$\w]*$/.test(key) ? key : `'${key}'`;
    return `  ${property}: '${val}',`;
  });
  const content = `${HEADER}\nmodule.exports = {\n${lines.join('\n')}\n};\n`;
  mkdirSync(resolve(DIST_DIR, 'tailwind'), { recursive: true });
  writeFileSync(resolve(DIST_DIR, `tailwind/${fileName}`), content);
}

function generateTailwindModules(tokens) {
  // colors.js
  const colorTokens = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'color');
  writeTWModule(
    TAILWIND_OUTPUT.v3ThemeFiles.colors,
    colorTokens.map(t => [t.name, `var(--${t.name})`]),
  );

  // spacing.js
  const spacingTokens = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'spacing');
  writeTWModule(
    TAILWIND_OUTPUT.v3ThemeFiles.spacing,
    spacingTokens.map(t => [t.name.replace('spacing-', ''), `var(--${t.name})`]),
  );

  // radius.js
  const radiusTokens = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'radius');
  writeTWModule(
    TAILWIND_OUTPUT.v3ThemeFiles.radius,
    radiusTokens.map(t => [t.name.replace('radius-', ''), `var(--${t.name})`]),
  );

  // effects.js
  const effectTokens = tokens.filter(t => t.path[0] === 'effect');
  writeTWModule(
    TAILWIND_OUTPUT.v3ThemeFiles.effects,
    effectTokens.map(t => {
      let key = t.name;
      if (key.startsWith('effect-')) key = key.replace('effect-', '');
      return [key, `var(--${t.name})`];
    }),
  );

  // screens.js
  const bpTokens = tokens.filter(t => t.path[0] === 'breakpoint');
  writeTWModule(
    TAILWIND_OUTPUT.v3ThemeFiles.screens,
    bpTokens.map(t => [t.name.replace('breakpoint-', ''), String(t.$value)]),
    { quoteKeys: false },
  );
}

// ---------------------------------------------------------------------------
// Shared Typography Helpers
// ---------------------------------------------------------------------------

const TOKEN_TO_CLASS = {
  'title-display1': 'title-display-lg',
  'title-display2': 'title-display-md',
};

function tokenGroupToClass(group) {
  if (TOKEN_TO_CLASS[group]) return TOKEN_TO_CLASS[group];
  return group
    .replace(/-l$/, '-lg')
    .replace(/-m-base$/, '-base')
    .replace(/-s$/, '-sm');
}

const LETTER_SPACING_GROUPS = new Set(['title-display1', 'title-display2']);

const TYPO_GROUP_ORDER = [
  'title-display1',
  'title-display2',
  'title-h1',
  'title-h2',
  'title-h3',
  'title-h4',
  'title-h5',
  'title-h6',
  'body-2xl',
  'body-xl',
  'body-l',
  'body-m-base',
  'body-s',
  'body-xs',
  'body-2xs',
  'subheading-m-base',
  'subheading-s',
  'subheading-xs',
  'subheading-2xs',
  'label-l',
  'label-m-base',
  'label-s',
  'label-underline-s',
  'label-underline-m-base',
  'label-underline-l',
];

const TYPO_PROPS = ['font', 'size', 'line-weight', 'line-height'];

/**
 * Derive ordered typography groups and breakpoint values from tokens.
 * Shared by both v3 (JS) and v4 (CSS) typography generators.
 */
function resolveTypography(tokens) {
  const mobileData = readJSON(resolve(TOKENS_DIR, 'responsive/mobile.json'));
  const mobileTokenKeys = Object.keys(mobileData.responsive?.mobile || {}).filter(k => !k.startsWith('$'));
  const typoGroups = [...new Set(mobileTokenKeys.map(k => k.replace(/-(font|size|line-weight|line-height)$/, '')))];

  const orderedGroups = [...TYPO_GROUP_ORDER];
  for (const g of typoGroups) {
    if (!orderedGroups.includes(g)) orderedGroups.push(g);
  }
  // Filter to only groups that actually exist in mobile.json
  const activeGroups = orderedGroups.filter(g => typoGroups.includes(g));

  const bpTokens = tokens.filter(t => t.path[0] === 'breakpoint');
  const tabletBP = bpTokens.find(t => t.name === 'breakpoint-md')?.$value || '905px';
  const desktopBP = bpTokens.find(t => t.name === 'breakpoint-lg')?.$value || '1248px';

  return { activeGroups, tabletBP, desktopBP };
}

// ---------------------------------------------------------------------------
// Typography.js Generation — Tailwind v3 (addComponents plugin)
// ---------------------------------------------------------------------------

function generateTypographyJS(tokens) {
  const { activeGroups, tabletBP, desktopBP } = resolveTypography(tokens);

  const cssPropMap = {
    'font': 'fontFamily',
    'size': 'fontSize',
    'line-weight': 'fontWeight',
    'line-height': 'lineHeight',
  };

  const componentsObj = {};
  for (const group of activeGroups) {
    const className = `.${tokenGroupToClass(group)}`;
    const rule = {};
    for (const p of TYPO_PROPS) {
      rule[cssPropMap[p]] = `var(--mobile-${group}-${p})`;
    }
    if (LETTER_SPACING_GROUPS.has(group)) {
      rule['letterSpacing'] = '-4.8px';
    }
    const tabletRule = {};
    for (const p of TYPO_PROPS) {
      tabletRule[cssPropMap[p]] = `var(--tablet-${group}-${p})`;
    }
    rule[`@media (min-width: ${tabletBP})`] = tabletRule;
    const desktopRule = {};
    for (const p of TYPO_PROPS) {
      desktopRule[cssPropMap[p]] = `var(--desktop-${group}-${p})`;
    }
    rule[`@media (min-width: ${desktopBP})`] = desktopRule;
    componentsObj[className] = rule;
  }

  function serializeObj(obj, indent = 6, quoteKeys = true) {
    const pad = ' '.repeat(indent);
    const lines = [];
    for (const [key, val] of Object.entries(obj)) {
      const isMediaQuery = key.startsWith('@');
      const k = quoteKeys || isMediaQuery ? `'${key}'` : key;
      if (typeof val === 'object') {
        lines.push(`${pad}${k}: {`);
        lines.push(serializeObj(val, indent + 2, false));
        lines.push(`${pad}},`);
      } else {
        const v = `'${val}'`;
        lines.push(`${pad}${k}: ${v},`);
      }
    }
    return lines.join('\n');
  }

  const componentEntries = [];
  for (const [cls, rule] of Object.entries(componentsObj)) {
    componentEntries.push(`    '${cls}': {\n${serializeObj(rule)}\n    },`);
  }

  const typographyContent = `${HEADER}
module.exports = function ({ addComponents }) {
  addComponents({
${componentEntries.join('\n')}
  });
};
`;

  mkdirSync(resolve(DIST_DIR, 'tailwind'), { recursive: true });
  writeFileSync(resolve(DIST_DIR, `tailwind/${TAILWIND_OUTPUT.v3ComponentFiles.typography}`), typographyContent);
}

// ---------------------------------------------------------------------------
// Tailwind v4 Output Generation
// ---------------------------------------------------------------------------

/**
 * Generate @theme inline CSS for Tailwind v4.
 * Maps all token CSS custom properties to Tailwind theme variables.
 * Uses @theme inline so var() refs are preserved for runtime theming.
 */
function generateTailwindV4Theme(tokens) {
  const lines = [];
  lines.push('@theme inline {');

  // Primitive colors → --color-{name}
  const colors = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'color');
  lines.push('  /* Primitive Colors */');
  for (const t of colors) lines.push(`  --color-${t.name}: var(--${t.name});`);

  // Semantic colors → --color-{name}
  const semantic = tokens.filter(t => t.path[0] === 'semantic');
  lines.push('');
  lines.push('  /* Semantic Colors */');
  for (const t of semantic) lines.push(`  --color-${t.name}: var(--${t.name});`);

  // Spacing → --spacing-{key}
  const spacing = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'spacing');
  lines.push('');
  lines.push('  /* Spacing */');
  for (const t of spacing) {
    const key = t.name.replace('spacing-', '');
    lines.push(`  --spacing-${key}: var(--${t.name});`);
  }

  // Radius → --radius-{key}
  const radius = tokens.filter(t => t.path[0] === 'base' && t.path[1] === 'radius');
  lines.push('');
  lines.push('  /* Border Radius */');
  for (const t of radius) {
    const key = t.name.replace('radius-', '');
    lines.push(`  --radius-${key}: var(--${t.name});`);
  }

  // Effects → --shadow-{key}
  const effects = tokens.filter(t => t.path[0] === 'effect');
  lines.push('');
  lines.push('  /* Box Shadow */');
  for (const t of effects) {
    const key = t.name.startsWith('effect-') ? t.name.replace('effect-', '') : t.name;
    lines.push(`  --shadow-${key}: var(--${t.name});`);
  }

  // Breakpoints → --breakpoint-{key} (static values, not var refs)
  const bps = tokens.filter(t => t.path[0] === 'breakpoint');
  lines.push('');
  lines.push('  /* Breakpoints */');
  for (const t of bps) {
    const key = t.name.replace('breakpoint-', '');
    lines.push(`  --breakpoint-${key}: ${t.$value};`);
  }

  lines.push('}');

  mkdirSync(resolve(DIST_DIR, 'tailwind'), { recursive: true });
  writeFileSync(resolve(DIST_DIR, 'tailwind/_theme-vars.css'), `${HEADER}\n${lines.join('\n')}\n`);
}

/**
 * Generate @layer components CSS for Tailwind v4 responsive typography.
 * Replaces the JS addComponents() approach from v3.
 */
function generateTailwindV4Components(tokens) {
  const { activeGroups, tabletBP, desktopBP } = resolveTypography(tokens);

  const cssPropMap = {
    'font': 'font-family',
    'size': 'font-size',
    'line-weight': 'font-weight',
    'line-height': 'line-height',
  };

  const lines = ['@layer components {'];

  for (let i = 0; i < activeGroups.length; i++) {
    const group = activeGroups[i];
    const className = tokenGroupToClass(group);

    if (i > 0) lines.push('');
    lines.push(`  .${className} {`);
    for (const p of TYPO_PROPS) {
      lines.push(`    ${cssPropMap[p]}: var(--mobile-${group}-${p});`);
    }
    if (LETTER_SPACING_GROUPS.has(group)) {
      lines.push('    letter-spacing: -4.8px;');
    }

    // Tablet
    lines.push('');
    lines.push(`    @media (min-width: ${tabletBP}) {`);
    for (const p of TYPO_PROPS) {
      lines.push(`      ${cssPropMap[p]}: var(--tablet-${group}-${p});`);
    }
    lines.push('    }');

    // Desktop
    lines.push('');
    lines.push(`    @media (min-width: ${desktopBP}) {`);
    for (const p of TYPO_PROPS) {
      lines.push(`      ${cssPropMap[p]}: var(--desktop-${group}-${p});`);
    }
    lines.push('    }');

    lines.push('  }');
  }

  lines.push('}');

  mkdirSync(resolve(DIST_DIR, 'tailwind'), { recursive: true });
  writeFileSync(resolve(DIST_DIR, `tailwind/${TAILWIND_OUTPUT.v4ComponentFile}`), `${HEADER}\n${lines.join('\n')}\n`);
}

/**
 * Merge _theme-vars.css + _components.css into a single theme.css
 */
function mergeTailwindV4CSS() {
  const twDir = resolve(DIST_DIR, 'tailwind');
  const themeVars = readFileSync(resolve(twDir, '_theme-vars.css'), 'utf-8');
  const components = readFileSync(resolve(twDir, TAILWIND_OUTPUT.v4ComponentFile), 'utf-8');
  const merged = `${HEADER}\n${themeVars.replace(HEADER, '').trim()}\n\n${components.replace(HEADER, '').trim()}\n`;
  writeFileSync(resolve(twDir, TAILWIND_OUTPUT.v4ThemeFile), merged);
}

// ---------------------------------------------------------------------------
// Component Styles (SCSS → CSS)
// ---------------------------------------------------------------------------

const STYLES_DIR = resolve(ROOT, 'styles');

function compileComponentStyles() {
  const entry = resolve(STYLES_DIR, '_index.scss');
  if (!existsSync(entry)) return null;
  const result = sass.compile(entry, { style: 'expanded' });
  return result.css;
}

function compileFonts() {
  const entry = resolve(STYLES_DIR, 'foundations/_fonts.scss');
  if (!existsSync(entry)) return null;
  const result = sass.compile(entry, { style: 'expanded' });
  return result.css;
}

// ---------------------------------------------------------------------------
// Brand Discovery
// ---------------------------------------------------------------------------

function discoverBrands() {
  const brands = ['default'];
  const brandsDir = resolve(TOKENS_DIR, 'primitives/brands');
  if (existsSync(brandsDir)) {
    for (const entry of readdirSync(brandsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) brands.push(entry.name);
    }
  }
  return brands;
}

// ---------------------------------------------------------------------------
// SD4 Token Processing
// ---------------------------------------------------------------------------

async function processTokens(tree) {
  mkdirSync(TMP_DIR, { recursive: true });

  _collected = null;
  const sd = new StyleDictionary({
    tokens: tree,
    usesDtcg: true,
    platforms: {
      collect: {
        transformGroup: 'takeoff',
        buildPath: TMP_DIR + '/',
        files: [{ destination: '_collect.json', format: 'takeoff/collect' }],
      },
    },
    log: {
      warnings: 'disabled',
      verbosity: 'silent',
      errors: { brokenReferences: 'console' },
    },
  });

  await sd.buildAllPlatforms();
  return _collected;
}

// ---------------------------------------------------------------------------
// Main Build
// ---------------------------------------------------------------------------

async function build() {
  if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true });

  const brands = discoverBrands();
  const sortedBrands = ['default', ...brands.filter(b => b !== 'default')];
  const summary = [];

  // ── Compile component styles once (brand-independent) ────────────
  const componentCss = compileComponentStyles();
  if (componentCss) {
    console.log(`  component styles: ${componentCss.length} bytes compiled`);
  }

  // ── Compile fonts.css (brand-independent) ──────────────────────────
  const fontsCss = compileFonts();
  if (fontsCss) {
    const fontsDir = resolve(DIST_DIR, 'css');
    mkdirSync(fontsDir, { recursive: true });
    writeFileSync(resolve(fontsDir, 'fonts.css'), `${HEADER}\n${fontsCss}\n`);
    console.log(`  fonts.css: ${fontsCss.length} bytes compiled`);
  }

  for (const brand of sortedBrands) {
    // ── Light build ──────────────────────────────────────────────────
    const lightTree = buildTokenTree(brand, 'light');
    const lightResult = await processTokens(lightTree);
    const lightTokens = lightResult.allTokens;
    const lightScss = generateLightScss(lightTokens, ':root');

    // ── Dark build ───────────────────────────────────────────────────
    const darkTree = buildTokenTree(brand, 'dark');
    const darkResult = await processTokens(darkTree);
    const darkTokens = darkResult.allTokens;
    const darkScss = generateDarkScss(darkTokens, "[data-theme='dark']");

    // ── variables content (tokens only) ──────────────────────────────
    const variablesContent = [HEADER, lightScss, darkScss].filter(Boolean).join('\n\n') + '\n';

    // ── theme content (tokens + component styles) ────────────────────
    const themeParts = [];
    let componentBody = componentCss || '';
    // Extract @import rules — CSS requires them at the very top of the file
    const importLines = [];
    componentBody = componentBody.replace(/^@import\s+url\([^)]+\);?\s*$/gm, match => {
      importLines.push(match.trim());
      return '';
    });
    if (importLines.length) {
      themeParts.push(importLines.join('\n'));
    }
    themeParts.push(variablesContent);
    if (componentBody.trim()) {
      themeParts.push('\n/* ===== Component Styles ===== */\n' + componentBody);
    }
    const themeContent = themeParts.join('\n');

    // ── Write per-brand CSS outputs ──────────────────────────────────
    const cssDir = resolve(DIST_DIR, 'css', brand);
    mkdirSync(cssDir, { recursive: true });
    writeFileSync(resolve(cssDir, 'variables.css'), variablesContent);
    writeFileSync(resolve(cssDir, 'theme.css'), themeContent);

    // ── Write SCSS (default brand only) ──────────────────────────────
    if (brand === 'default') {
      const scssDir = resolve(DIST_DIR, 'scss');
      mkdirSync(scssDir, { recursive: true });
      writeFileSync(resolve(scssDir, '_variables.scss'), variablesContent);
      if (componentCss) {
        writeFileSync(resolve(scssDir, '_components.scss'), `${HEADER}\n${componentCss}\n`);
      }
    }

    // ── JS/ESM output ────────────────────────────────────────────────
    const jsDir = resolve(DIST_DIR, 'js', brand);
    mkdirSync(jsDir, { recursive: true });
    const jsTokens = {};
    for (const t of lightTokens) {
      jsTokens[t.name] = t.$value;
    }
    const esmContent = `${HEADER}\n${Object.entries(jsTokens)
      .map(([k, v]) => `export const ${k.replace(/[^a-zA-Z0-9_]/g, '_')} = ${JSON.stringify(v)};`)
      .join('\n')}\nexport default ${JSON.stringify(jsTokens, null, 2)};\n`;
    writeFileSync(resolve(jsDir, 'tokens.mjs'), esmContent);

    // ── Tailwind modules (default brand only) ────────────────────────
    if (brand === 'default') {
      generateTailwindModules(lightTokens);
      generateTypographyJS(lightTokens);
      generateTailwindV4Theme(lightTokens);
      generateTailwindV4Components(lightTokens);
      mergeTailwindV4CSS();
    }

    // ── Summary ───────────────────────────────────────────────────────
    const tokenCount = (lightScss.match(/--[\w-]+:/g) || []).length;
    summary.push(`  ${brand}: ${tokenCount} tokens`);
  }

  // ── Clean up ───────────────────────────────────────────────────────
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true });

  // ── Print summary ──────────────────────────────────────────────────
  console.log(`@takeoff-design/tokens: ${sortedBrands.length} brands built`);
  summary.forEach(l => console.log(l));
  if (unresolvedRefCount > 0) {
    console.warn(`  ${unresolvedRefCount} unresolved reference(s)`);
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
