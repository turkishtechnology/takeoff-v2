/**
 * Unit & integration tests for sync-figma.mjs
 *
 * NOTE: sync-figma.mjs does not export any functions. These tests replicate
 * the pure-logic helpers inline so we can unit-test them. A recommended future
 * refactor is to extract transformRef, flattenName, getLeafTokens, and the
 * config constants into a shared module and export them.
 *
 * Integration tests create a temporary Figma export JSON, run the script,
 * and verify the generated token files.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(__dirname, '..');
const ROOT = resolve(SCRIPTS_DIR, '..');
const TOKENS_DIR = resolve(ROOT, 'tokens');

// ============================================================================
// 1. transformRef — replicated from sync-figma.mjs (lines 123-176)
// ============================================================================

function transformRef(figmaRef, context) {
  if (typeof figmaRef !== 'string' || !figmaRef.startsWith('{') || !figmaRef.endsWith('}')) {
    return figmaRef;
  }
  const inner = figmaRef.slice(1, -1);
  const parts = inner.split('.');

  if (context === 'semantic-color') {
    if (parts[0] === 'alpha') {
      const alphaName = 'alpha-' + parts.slice(1).join('-');
      return `{base.color.alpha.${alphaName}}`;
    }
    return `{base.color.${inner}}`;
  }

  if (context === 'responsive-typo') {
    if (parts[0] === 'family' || parts[0] === 'weight' || parts[0] === 'size') {
      return `{base.typography.${inner}}`;
    }
    if (parts[0] === 'line-height' && parts.length === 3) {
      return `{base.typography.line-height.${parts[1]}-${parts[2]}}`;
    }
    if (parts.length === 1) {
      return `{base.typography.line-height.${parts[0]}-normal}`;
    }
    return `{base.typography.${inner}}`;
  }

  if (context === 'component') {
    if (parts[0] === 'spacing') return `{base.spacing.${parts.slice(1).join('.')}}`;
    if (parts[0] === 'radius') return `{base.radius.${parts.slice(1).join('.')}}`;
    return `{base.${inner}}`;
  }

  return figmaRef;
}

describe('transformRef', () => {
  describe('non-reference values pass through', () => {
    it('returns raw string values unchanged', () => {
      expect(transformRef('#ff0000', 'semantic-color')).toBe('#ff0000');
    });

    it('returns numbers unchanged', () => {
      expect(transformRef(42, 'component')).toBe(42);
    });

    it('returns null/undefined unchanged', () => {
      expect(transformRef(null, 'component')).toBe(null);
    });
  });

  describe('semantic-color context', () => {
    it('{primary.500} -> {base.color.primary.500}', () => {
      expect(transformRef('{primary.500}', 'semantic-color')).toBe('{base.color.primary.500}');
    });

    it('{neutral.50} -> {base.color.neutral.50}', () => {
      expect(transformRef('{neutral.50}', 'semantic-color')).toBe('{base.color.neutral.50}');
    });

    it('{static.black} -> {base.color.static.black}', () => {
      expect(transformRef('{static.black}', 'semantic-color')).toBe('{base.color.static.black}');
    });

    it('{alpha.base.black-8} -> {base.color.alpha.alpha-base-black-8}', () => {
      expect(transformRef('{alpha.base.black-8}', 'semantic-color')).toBe('{base.color.alpha.alpha-base-black-8}');
    });

    it('{alpha.brand.primary-500-8} -> {base.color.alpha.alpha-brand-primary-500-8}', () => {
      expect(transformRef('{alpha.brand.primary-500-8}', 'semantic-color')).toBe('{base.color.alpha.alpha-brand-primary-500-8}');
    });

    it('{secondary.300} -> {base.color.secondary.300}', () => {
      expect(transformRef('{secondary.300}', 'semantic-color')).toBe('{base.color.secondary.300}');
    });
  });

  describe('responsive-typo context', () => {
    it('{family.body} -> {base.typography.family.body}', () => {
      expect(transformRef('{family.body}', 'responsive-typo')).toBe('{base.typography.family.body}');
    });

    it('{weight.medium} -> {base.typography.weight.medium}', () => {
      expect(transformRef('{weight.medium}', 'responsive-typo')).toBe('{base.typography.weight.medium}');
    });

    it('{size.2xl} -> {base.typography.size.2xl}', () => {
      expect(transformRef('{size.2xl}', 'responsive-typo')).toBe('{base.typography.size.2xl}');
    });

    it('{line-height.sm.normal} -> {base.typography.line-height.sm-normal}', () => {
      expect(transformRef('{line-height.sm.normal}', 'responsive-typo')).toBe('{base.typography.line-height.sm-normal}');
    });

    it('{line-height.2xl.tight} -> {base.typography.line-height.2xl-tight}', () => {
      expect(transformRef('{line-height.2xl.tight}', 'responsive-typo')).toBe('{base.typography.line-height.2xl-tight}');
    });

    it('{2xl} (single part) -> {base.typography.line-height.2xl-normal}', () => {
      expect(transformRef('{2xl}', 'responsive-typo')).toBe('{base.typography.line-height.2xl-normal}');
    });

    it('{base} (single part) -> {base.typography.line-height.base-normal}', () => {
      expect(transformRef('{base}', 'responsive-typo')).toBe('{base.typography.line-height.base-normal}');
    });
  });

  describe('component context', () => {
    it('{spacing.xl} -> {base.spacing.xl}', () => {
      expect(transformRef('{spacing.xl}', 'component')).toBe('{base.spacing.xl}');
    });

    it('{spacing.2xs} -> {base.spacing.2xs}', () => {
      expect(transformRef('{spacing.2xs}', 'component')).toBe('{base.spacing.2xs}');
    });

    it('{radius.s} -> {base.radius.s}', () => {
      expect(transformRef('{radius.s}', 'component')).toBe('{base.radius.s}');
    });

    it('{radius.full} -> {base.radius.full}', () => {
      expect(transformRef('{radius.full}', 'component')).toBe('{base.radius.full}');
    });

    it('unknown prefix falls back to {base.<inner>}', () => {
      expect(transformRef('{color.primary.500}', 'component')).toBe('{base.color.primary.500}');
    });
  });
});

// ============================================================================
// 2. flattenName — replicated from sync-figma.mjs (lines 183-185)
// ============================================================================

function flattenName(figmaPath) {
  return figmaPath.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
}

describe('flattenName', () => {
  it('primary/lightest -> primary-lightest', () => {
    expect(flattenName('primary/lightest')).toBe('primary-lightest');
  });

  it('states/info/base -> states-info-base', () => {
    expect(flattenName('states/info/base')).toBe('states-info-base');
  });

  it('bg primary -> bg-primary (spaces converted)', () => {
    expect(flattenName('bg primary')).toBe('bg-primary');
  });

  it('empty string -> empty string', () => {
    expect(flattenName('')).toBe('');
  });

  it('UPPERCASE/Path -> uppercase-path (lowercased)', () => {
    expect(flattenName('UPPERCASE/Path')).toBe('uppercase-path');
  });

  it('nested/deep/path/to/token -> nested-deep-path-to-token', () => {
    expect(flattenName('nested/deep/path/to/token')).toBe('nested-deep-path-to-token');
  });
});

// ============================================================================
// 3. getLeafTokens — replicated from sync-figma.mjs (lines 96-109)
// ============================================================================

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

describe('getLeafTokens', () => {
  it('should extract flat tokens', () => {
    const obj = {
      primary: { $value: '#3b82f6', $type: 'color' },
      secondary: { $value: '#8b5cf6', $type: 'color' },
    };
    const result = getLeafTokens(obj);
    expect(Object.keys(result)).toEqual(['primary', 'secondary']);
    expect(result['primary'].$value).toBe('#3b82f6');
  });

  it('should extract nested tokens with / paths', () => {
    const obj = {
      primary: {
        50: { $value: '#eff6ff' },
        500: { $value: '#3b82f6' },
      },
    };
    const result = getLeafTokens(obj);
    expect(Object.keys(result)).toEqual(['primary/50', 'primary/500']);
    expect(result['primary/500'].$value).toBe('#3b82f6');
  });

  it('should handle deeply nested structures', () => {
    const obj = {
      states: {
        info: {
          base: { $value: '{primary.500}', $type: 'color' },
          hover: { $value: '{primary.600}', $type: 'color' },
        },
      },
    };
    const result = getLeafTokens(obj);
    expect(Object.keys(result)).toEqual(['states/info/base', 'states/info/hover']);
  });

  it('should return empty object for empty input', () => {
    expect(getLeafTokens({})).toEqual({});
  });

  it('should skip non-object values at top level', () => {
    const obj = {
      $type: 'color',
      primary: { $value: '#fff' },
    };
    const result = getLeafTokens(obj);
    // $type is a string, not an object — should be skipped
    expect(Object.keys(result)).toEqual(['primary']);
  });
});

// ============================================================================
// 4. COMPONENT_NAME_MAP — component name normalization
// ============================================================================

const COMPONENT_NAME_MAP = {
  'buttons': 'button',
  'tooltips': 'tooltip',
  'switcher': 'radio-checkbox',
  'breadcrumbs': 'breadcrumb',
  'notification': 'drawer',
  'rich text editor': 'editor',
  'tree-view': 'tree-view',
  'error 404': 'error-404',
  'empty-state': 'empty-state',
  'progress bar': 'progress-bar',
  'file upload': 'upload',
  'timestampt': 'timestamp',
  'Timeline': 'timeline',
};

describe('COMPONENT_NAME_MAP — component name normalization', () => {
  it('buttons -> button (singular)', () => {
    expect(COMPONENT_NAME_MAP['buttons']).toBe('button');
  });

  it('tooltips -> tooltip (singular)', () => {
    expect(COMPONENT_NAME_MAP['tooltips']).toBe('tooltip');
  });

  it('switcher -> radio-checkbox (semantic rename)', () => {
    expect(COMPONENT_NAME_MAP['switcher']).toBe('radio-checkbox');
  });

  it('notification -> drawer (collection rename)', () => {
    expect(COMPONENT_NAME_MAP['notification']).toBe('drawer');
  });

  it('rich text editor -> editor (abbreviation)', () => {
    expect(COMPONENT_NAME_MAP['rich text editor']).toBe('editor');
  });

  it('timestampt -> timestamp (typo fix)', () => {
    expect(COMPONENT_NAME_MAP['timestampt']).toBe('timestamp');
  });

  it('Timeline -> timeline (case normalization)', () => {
    expect(COMPONENT_NAME_MAP['Timeline']).toBe('timeline');
  });

  it('file upload -> upload', () => {
    expect(COMPONENT_NAME_MAP['file upload']).toBe('upload');
  });

  it('unmapped components fall through to lowercase + hyphen', () => {
    // This is the fallback in sync-figma.mjs:
    // COMPONENT_NAME_MAP[collection] || collection.toLowerCase().replace(/\s+/g, '-')
    const fallback = name => COMPONENT_NAME_MAP[name] || name.toLowerCase().replace(/\s+/g, '-');
    expect(fallback('input')).toBe('input');
    expect(fallback('card')).toBe('card');
    expect(fallback('sidebar')).toBe('sidebar');
    expect(fallback('datepicker')).toBe('datepicker');
  });
});

// ============================================================================
// 5. TYPO_MODE_TO_BRAND — brand detection from Figma font modes
// ============================================================================

const TYPO_MODE_TO_BRAND = {
  Geologica: 'thy',
  TK: 'ajet',
  clearview: 'aviation',
  Inter: 'technology',
  SARP: 'sarp',
};

describe('TYPO_MODE_TO_BRAND — brand detection', () => {
  it('Geologica -> thy (default brand)', () => {
    expect(TYPO_MODE_TO_BRAND['Geologica']).toBe('thy');
  });

  it('TK -> ajet', () => {
    expect(TYPO_MODE_TO_BRAND['TK']).toBe('ajet');
  });

  it('clearview -> aviation', () => {
    expect(TYPO_MODE_TO_BRAND['clearview']).toBe('aviation');
  });

  it('Inter -> technology', () => {
    expect(TYPO_MODE_TO_BRAND['Inter']).toBe('technology');
  });

  it('SARP -> sarp', () => {
    expect(TYPO_MODE_TO_BRAND['SARP']).toBe('sarp');
  });

  it('all brands are accounted for (5 entries)', () => {
    expect(Object.keys(TYPO_MODE_TO_BRAND)).toHaveLength(5);
  });
});

// ============================================================================
// 6. WEIGHT_MAP — Figma weight string to numeric
// ============================================================================

const WEIGHT_MAP = {
  Thin: 100,
  Extralight: 200,
  Light: 300,
  Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
  Extrabold: 800,
  Black: 900,
};

describe('WEIGHT_MAP', () => {
  it('maps all standard CSS font weight values', () => {
    expect(WEIGHT_MAP['Thin']).toBe(100);
    expect(WEIGHT_MAP['Regular']).toBe(400);
    expect(WEIGHT_MAP['Bold']).toBe(700);
    expect(WEIGHT_MAP['Black']).toBe(900);
  });

  it('covers all 9 standard weight levels', () => {
    const values = Object.values(WEIGHT_MAP).sort((a, b) => a - b);
    expect(values).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900]);
  });
});

// ============================================================================
// 7. RESPONSIVE_MODES mapping
// ============================================================================

const RESPONSIVE_MODES = {
  'Desktop (lg-xl)': 'desktop',
  'Tablet': 'tablet',
  'Mobile': 'mobile',
};

describe('RESPONSIVE_MODES', () => {
  it('Desktop (lg-xl) -> desktop', () => {
    expect(RESPONSIVE_MODES['Desktop (lg-xl)']).toBe('desktop');
  });

  it('Tablet -> tablet', () => {
    expect(RESPONSIVE_MODES['Tablet']).toBe('tablet');
  });

  it('Mobile -> mobile', () => {
    expect(RESPONSIVE_MODES['Mobile']).toBe('mobile');
  });
});

// ============================================================================
// 8. Integration test — run sync with mock Figma export
// ============================================================================

describe('sync-figma.mjs integration', () => {
  const BACKUP_DIR = resolve(ROOT, '.test-backup-tokens');
  const MOCK_EXPORT_PATH = resolve(ROOT, '.test-figma-export.json');

  /**
   * Minimal mock of a Figma export JSON. The sync script expects keys like
   * "primitive-colors/thy", "typography/Geologica", "spacing/Mode 1", etc.
   */
  const mockFigmaExport = {
    'primitive-colors/thy': {
      primary: {
        50: { $value: '#eff6ff', $type: 'color' },
        500: { $value: '#3b82f6', $type: 'color' },
        900: { $value: '#1e3a5f', $type: 'color' },
      },
      neutral: {
        50: { $value: '#fafafa', $type: 'color' },
        900: { $value: '#171717', $type: 'color' },
      },
      static: {
        black: { $value: '#000000', $type: 'color' },
        white: { $value: '#ffffff', $type: 'color' },
      },
      alpha: {
        base: {
          'black-8': { $value: 'rgba(0,0,0,0.08)', $type: 'color' },
        },
      },
    },
    'primitive-colors/ajet': {
      primary: {
        50: { $value: '#eff6ff', $type: 'color' },
        500: { $value: '#c80815', $type: 'color' }, // different from default
        900: { $value: '#1e3a5f', $type: 'color' },
      },
    },
    'typography/Geologica': {
      family: {
        body: { $value: 'Geologica', $type: 'fontFamily' },
        heading: { $value: 'Geologica', $type: 'fontFamily' },
      },
      size: {
        xs: { $value: 12, $type: 'dimension' },
        sm: { $value: 14, $type: 'dimension' },
        base: { $value: 16, $type: 'dimension' },
      },
      weight: {
        regular: { $value: 'Regular', $type: 'fontWeight' },
        medium: { $value: 'Medium', $type: 'fontWeight' },
        bold: { $value: 'Bold', $type: 'fontWeight' },
      },
    },
    'typography/TK': {
      family: {
        body: { $value: 'TK Fonts', $type: 'fontFamily' },
        heading: { $value: 'TK Display', $type: 'fontFamily' },
      },
      size: {
        xs: { $value: 12, $type: 'dimension' },
        sm: { $value: 14, $type: 'dimension' },
        base: { $value: 16, $type: 'dimension' },
      },
      weight: {
        regular: { $value: 'Regular', $type: 'fontWeight' },
        medium: { $value: 'Medium', $type: 'fontWeight' },
        bold: { $value: 'Bold', $type: 'fontWeight' },
      },
    },
    'typography-line-height/normal': {
      base: { $value: 24, $type: 'dimension' },
      sm: { $value: 20, $type: 'dimension' },
    },
    'typography-line-height/tight': {
      base: { $value: 20, $type: 'dimension' },
      sm: { $value: 16, $type: 'dimension' },
    },
    'typography-line-height/none': {
      base: { $value: 16, $type: 'dimension' },
      sm: { $value: 14, $type: 'dimension' },
    },
    'spacing/Mode 1': {
      spacing: {
        xs: { $value: 4, $type: 'dimension' },
        sm: { $value: 8, $type: 'dimension' },
        md: { $value: 16, $type: 'dimension' },
        xl: { $value: 32, $type: 'dimension' },
      },
    },
    'radius/value': {
      radius: {
        s: { $value: 4, $type: 'dimension' },
        m: { $value: 8, $type: 'dimension' },
        full: { $value: 9999, $type: 'dimension' },
      },
    },
    'semantic-colors/Light': {
      'bg-primary': { $value: '{static.white}', $type: 'color' },
      'bg-secondary': { $value: '{neutral.50}', $type: 'color' },
      'states': {
        info: {
          base: { $value: '{primary.500}', $type: 'color' },
        },
      },
    },
    'semantic-colors/Dark': {
      'bg-primary': { $value: '{neutral.900}', $type: 'color' },
      'bg-secondary': { $value: '{neutral.50}', $type: 'color' },
      'states': {
        info: {
          base: { $value: '{primary.500}', $type: 'color' },
        },
      },
    },
    'semantic-typography/Desktop (lg-xl)': {
      body: {
        xl: {
          'font': { $value: '{family.body}', $type: 'typography' },
          'size': { $value: '{size.base}', $type: 'typography' },
          'line-weight': { $value: '{weight.regular}', $type: 'typography' },
          'line-height': { $value: '{base}', $type: 'typography' },
        },
      },
    },
    'semantic-typography/Tablet': {
      body: {
        xl: {
          'font': { $value: '{family.body}', $type: 'typography' },
          'size': { $value: '{size.sm}', $type: 'typography' },
          'line-weight': { $value: '{weight.regular}', $type: 'typography' },
          'line-height': { $value: '{sm}', $type: 'typography' },
        },
      },
    },
    'semantic-typography/Mobile': {
      body: {
        xl: {
          'font': { $value: '{family.body}', $type: 'typography' },
          'size': { $value: '{size.xs}', $type: 'typography' },
          'line-weight': { $value: '{weight.regular}', $type: 'typography' },
          'line-height': { $value: '{sm}', $type: 'typography' },
        },
      },
    },
    'buttons/Mode 1': {
      'button-primary-bg': { $value: '{primary.500}', $type: 'color' },
      'button-height': { $value: 40, $type: 'dimension' },
      'button-padding': { $value: '{spacing.md}', $type: 'dimension' },
      'button-radius': { $value: '{radius.s}', $type: 'dimension' },
    },
    'tooltips/Mode 1': {
      'tooltip-bg': { $value: '{neutral.900}', $type: 'color' },
      'tooltip-padding': { $value: '{spacing.sm}', $type: 'dimension' },
    },
    'notification/Mode 1': {
      'notification-width': { $value: 320, $type: 'dimension' },
    },
  };

  beforeAll(() => {
    // Backup the real tokens directory
    if (existsSync(TOKENS_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
      cpSync(TOKENS_DIR, BACKUP_DIR, { recursive: true });
    }

    // Write the mock Figma export
    writeFileSync(MOCK_EXPORT_PATH, JSON.stringify(mockFigmaExport, null, 2));
  });

  afterAll(() => {
    // Restore original tokens
    if (existsSync(BACKUP_DIR)) {
      rmSync(TOKENS_DIR, { recursive: true, force: true });
      cpSync(BACKUP_DIR, TOKENS_DIR, { recursive: true });
      rmSync(BACKUP_DIR, { recursive: true, force: true });
    }

    // Clean up mock file (sync script deletes it, but just in case)
    if (existsSync(MOCK_EXPORT_PATH)) {
      rmSync(MOCK_EXPORT_PATH);
    }
  });

  it('should run the sync script without errors', () => {
    const result = execSync(`node scripts/sync-figma.mjs ${MOCK_EXPORT_PATH}`, { cwd: ROOT, stdio: 'pipe', timeout: 30_000 });
    expect(result.toString()).toContain('Figma sync complete');
  });

  it('should delete the input file after sync (cleanup behavior)', () => {
    // The script calls unlinkSync on the input file
    expect(existsSync(MOCK_EXPORT_PATH)).toBe(false);
  });

  it('should generate default primitive color files', () => {
    const primaryPath = resolve(TOKENS_DIR, 'primitives/default/color/primary.json');
    expect(existsSync(primaryPath)).toBe(true);

    const data = JSON.parse(readFileSync(primaryPath, 'utf-8'));
    expect(data.primary).toBeDefined();
    expect(data.primary['500']).toBeDefined();
    expect(data.primary['500'].$value).toBe('#3b82f6');
  });

  it('should generate alpha color tokens with alpha- prefix in leaf name', () => {
    const alphaPath = resolve(TOKENS_DIR, 'primitives/default/color/alpha.json');
    expect(existsSync(alphaPath)).toBe(true);

    const data = JSON.parse(readFileSync(alphaPath, 'utf-8'));
    expect(data.alpha).toBeDefined();
    // $type is hoisted to the group per DTCG §Inheritance; leaves inherit it.
    expect(data.alpha.$type).toBe('color');
    expect(data.alpha['alpha-base-black-8']).toBeDefined();
    expect(data.alpha['alpha-base-black-8'].$type).toBeUndefined();
  });

  it('should generate brand override files (only diffs)', () => {
    const brandPrimaryPath = resolve(TOKENS_DIR, 'primitives/brands/ajet/color/primary.json');
    expect(existsSync(brandPrimaryPath)).toBe(true);

    const data = JSON.parse(readFileSync(brandPrimaryPath, 'utf-8'));
    expect(data.primary).toBeDefined();
    // Only the diff should be present — 500 was different
    expect(data.primary['500'].$value).toBe('#c80815');
    // 50 and 900 were identical, should NOT be in override file
    expect(data.primary['50']).toBeUndefined();
    expect(data.primary['900']).toBeUndefined();
  });

  it('should generate default typography files', () => {
    const familyPath = resolve(TOKENS_DIR, 'primitives/default/typography/family.json');
    expect(existsSync(familyPath)).toBe(true);

    const data = JSON.parse(readFileSync(familyPath, 'utf-8'));
    expect(data.family.body.$value).toBe('Geologica');
    expect(data.family.heading.$value).toBe('Geologica');

    const sizePath = resolve(TOKENS_DIR, 'primitives/default/typography/size.json');
    const sizeData = JSON.parse(readFileSync(sizePath, 'utf-8'));
    expect(sizeData.size.base.$value).toBe('16px');
    expect(sizeData.size.$type).toBe('dimension');

    const weightPath = resolve(TOKENS_DIR, 'primitives/default/typography/weight.json');
    const weightData = JSON.parse(readFileSync(weightPath, 'utf-8'));
    expect(weightData.weight.regular.$value).toBe(400);
    expect(weightData.weight.medium.$value).toBe(500);
    expect(weightData.weight.bold.$value).toBe(700);
  });

  it('should generate brand typography overrides (only family diffs)', () => {
    const ajetFamilyPath = resolve(TOKENS_DIR, 'primitives/brands/ajet/typography/family.json');
    expect(existsSync(ajetFamilyPath)).toBe(true);

    const data = JSON.parse(readFileSync(ajetFamilyPath, 'utf-8'));
    expect(data.family.body.$value).toBe('TK Fonts');
    expect(data.family.heading.$value).toBe('TK Display');
  });

  it('should generate line-height tokens with dimensional and unitless variants', () => {
    const lhPath = resolve(TOKENS_DIR, 'primitives/default/typography/line-height.json');
    expect(existsSync(lhPath)).toBe(true);

    const data = JSON.parse(readFileSync(lhPath, 'utf-8'));

    // Dimensional: size-mode (e.g., "base-normal")
    expect(data['line-height']['base-normal'].$value).toBe('24px');
    expect(data['line-height']['base-normal'].$type).toBe('dimension');

    // Unitless: mode-size (e.g., "normal-base")
    expect(data['line-height']['normal-base'].$value).toBe(24);
    expect(data['line-height']['normal-base'].$type).toBe('number');

    // Tight variant
    expect(data['line-height']['base-tight'].$value).toBe('20px');
    expect(data['line-height']['tight-base'].$value).toBe(20);
  });

  it('should generate spacing.json with px values', () => {
    const spacingPath = resolve(TOKENS_DIR, 'primitives/default/spacing.json');
    expect(existsSync(spacingPath)).toBe(true);

    const data = JSON.parse(readFileSync(spacingPath, 'utf-8'));
    expect(data.spacing.$type).toBe('dimension');
    expect(data.spacing.xs.$value).toBe('4px');
    expect(data.spacing.sm.$value).toBe('8px');
    expect(data.spacing.xl.$value).toBe('32px');
  });

  it('should generate radius.json with px values', () => {
    const radiusPath = resolve(TOKENS_DIR, 'primitives/default/radius.json');
    expect(existsSync(radiusPath)).toBe(true);

    const data = JSON.parse(readFileSync(radiusPath, 'utf-8'));
    expect(data.radius.$type).toBe('dimension');
    expect(data.radius.s.$value).toBe('4px');
    expect(data.radius.full.$value).toBe('9999px');
  });

  it('should generate semantic color files with transformed references', () => {
    const lightPath = resolve(TOKENS_DIR, 'semantic/light.json');
    expect(existsSync(lightPath)).toBe(true);

    const data = JSON.parse(readFileSync(lightPath, 'utf-8'));
    // $type hoisted to semantic group per DTCG §Inheritance; descendants inherit.
    expect(data.semantic.$type).toBe('color');
    expect(data.semantic['bg-primary'].$value).toBe('{base.color.static.white}');
    expect(data.semantic['bg-secondary'].$value).toBe('{base.color.neutral.50}');
    // Nested paths reflect Figma hierarchy, not flat hyphenated keys.
    expect(data.semantic.states.info.base.$value).toBe('{base.color.primary.500}');
    expect(data.semantic.states.info.base.$type).toBeUndefined();
  });

  it('should generate both light and dark semantic files', () => {
    const darkPath = resolve(TOKENS_DIR, 'semantic/dark.json');
    expect(existsSync(darkPath)).toBe(true);

    const data = JSON.parse(readFileSync(darkPath, 'utf-8'));
    expect(data.semantic['bg-primary'].$value).toBe('{base.color.neutral.900}');
  });

  it('should generate responsive typography with transformed refs', () => {
    const desktopPath = resolve(TOKENS_DIR, 'responsive/desktop.json');
    expect(existsSync(desktopPath)).toBe(true);

    const data = JSON.parse(readFileSync(desktopPath, 'utf-8'));
    const desktop = data.responsive.desktop;

    expect(desktop['body-xl-font'].$value).toBe('{base.typography.family.body}');
    expect(desktop['body-xl-size'].$value).toBe('{base.typography.size.base}');
    expect(desktop['body-xl-line-weight'].$value).toBe('{base.typography.weight.regular}');
    // {base} single part -> {base.typography.line-height.base-normal}
    expect(desktop['body-xl-line-height'].$value).toBe('{base.typography.line-height.base-normal}');
  });

  it('should generate component files with correct naming', () => {
    // "buttons" -> "button" via COMPONENT_NAME_MAP
    const buttonPath = resolve(TOKENS_DIR, 'component/button.json');
    expect(existsSync(buttonPath)).toBe(true);

    const data = JSON.parse(readFileSync(buttonPath, 'utf-8'));
    expect(data.component.button).toBeDefined();
    expect(data.component.button['button-height'].$value).toBe('40px');
    // Component reference: {spacing.md} -> {base.spacing.md}
    expect(data.component.button['button-padding'].$value).toBe('{base.spacing.md}');
    // Component reference: {radius.s} -> {base.radius.s}
    expect(data.component.button['button-radius'].$value).toBe('{base.radius.s}');
  });

  it('should normalize "tooltips" to "tooltip"', () => {
    const tooltipPath = resolve(TOKENS_DIR, 'component/tooltip.json');
    expect(existsSync(tooltipPath)).toBe(true);

    const data = JSON.parse(readFileSync(tooltipPath, 'utf-8'));
    expect(data.component.tooltip).toBeDefined();
    expect(data.component.tooltip['tooltip-padding'].$value).toBe('{base.spacing.sm}');
  });

  it('should normalize "notification" to "drawer"', () => {
    const drawerPath = resolve(TOKENS_DIR, 'component/drawer.json');
    expect(existsSync(drawerPath)).toBe(true);

    const data = JSON.parse(readFileSync(drawerPath, 'utf-8'));
    expect(data.component.drawer).toBeDefined();
    expect(data.component.drawer['notification-width'].$value).toBe('320px');
  });
});
