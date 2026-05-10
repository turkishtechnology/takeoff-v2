#!/usr/bin/env node

/* eslint-disable no-console */
/* global process, console */

/**
 * Component scaffold generator for @takeoff-ui/react-spar.
 *
 * Usage: node scripts/generate-component.mjs <PascalCaseName>
 * Example: node scripts/generate-component.mjs Tooltip
 *
 * Produces the bare directory skeleton that mirrors the Accordion reference
 * (see src/components/accordion/). The generated wrapper is intentionally a
 * minimal Spar-primitive wrapper — wire it to the real Spar primitive,
 * extend the Props interface, and add tests by hand. The base.ts pattern
 * (one createComponentBase per public sub-component, all in one file)
 * scales to compound components like Accordion.
 *
 * Creates:
 *   src/components/<kebab>/
 *     <Name>.tsx
 *     <Name>.test.tsx
 *     base.ts
 *     index.ts
 *     types.ts
 *
 * Updates:
 *   src/components/index.ts   (barrel export)
 *   src/slot-registry.ts      (slot-class entry)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');
const componentsDir = resolve(packageDir, 'src/components');
const slotRegistryPath = resolve(packageDir, 'src/slot-registry.ts');
const componentsIndexPath = resolve(componentsDir, 'index.ts');

const name = process.argv[2];

if (!name || !/^[A-Z][a-zA-Z]+$/.test(name)) {
  console.error('Usage: node scripts/generate-component.mjs <PascalCaseName>');
  console.error('Example: node scripts/generate-component.mjs Tooltip');
  process.exit(1);
}

const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const camel = name[0].toLowerCase() + name.slice(1);
const prefix = `tk-${kebab}`;
const componentDir = resolve(componentsDir, kebab);

if (existsSync(componentDir)) {
  console.error(`Component directory already exists: src/components/${kebab}`);
  process.exit(1);
}

mkdirSync(componentDir, { recursive: true });

writeFileSync(
  resolve(componentDir, 'types.ts'),
  `import type { ComponentPropsWithoutRef } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type ${name}Slot = 'root';

export interface ${name}Props extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<${name}Slot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<${name}Slot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    ${name}: import('../../core').ComponentThemeConfig<${name}Props>;
  }
}
`,
);

writeFileSync(
  resolve(componentDir, 'base.ts'),
  `import { createComponentBase } from '../../core';

import type { ${name}Props } from './types';

export const ${name}Base = createComponentBase<${name}Props, 'root'>({
  name: '${name}',
  slots: ['root'] as const,
  classes: { root: '${prefix}' },
});
`,
);

writeFileSync(
  resolve(componentDir, `${name}.tsx`),
  `import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ${name}Base } from './base';
import type { ${name}Props } from './types';

// TODO: wire to the matching Spar primitive (e.g. <Spar${name}>) and extend
// ${name}Props with its public surface. Until then this renders a plain <div>.
export const ${name} = (props: ${name}Props) => {
  const theme = useComponentTheme('${name}');
  const { rootAttrs, rest } = composeRootAttrs(${name}Base, props, theme);
  const { children, ...domProps } = rest;

  return (
    <div {...domProps} {...rootAttrs}>
      {children}
    </div>
  );
};

${name}.displayName = '${name}';
`,
);

writeFileSync(
  resolve(componentDir, `${name}.test.tsx`),
  `import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { ${name} } from './${name}';

describe('${name} — anatomy', () => {
  it('renders the canonical tk-* class on the root slot', () => {
    const { container } = render(<${name}>content</${name}>);
    const root = container.querySelector('[data-slot="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('${prefix}');
  });

  it('appends instance className without dropping the canonical class', () => {
    const { container } = render(<${name} className="extra">content</${name}>);
    const root = container.querySelector('[data-slot="root"]') as HTMLElement;
    expect(root.className).toContain('${prefix}');
    expect(root.className).toContain('extra');
  });
});
`,
);

writeFileSync(
  resolve(componentDir, 'index.ts'),
  `export { ${name} } from './${name}';
export type { ${name}Props, ${name}Slot } from './types';
`,
);

const componentsIndex = readFileSync(componentsIndexPath, 'utf8');
if (!componentsIndex.includes(`./${kebab}`)) {
  const updatedIndex = componentsIndex.trimEnd() + `\nexport * from './${kebab}';\n`;
  writeFileSync(componentsIndexPath, updatedIndex);
  console.log(`Updated src/components/index.ts`);
}

const slotRegistry = readFileSync(slotRegistryPath, 'utf8');
if (!slotRegistry.includes(`${name}Base`)) {
  const importLine = `import { ${name}Base } from './components/${kebab}/base';`;
  const slotEntry = `  ${camel}: { slots: ${name}Base.classes },`;

  let updated = slotRegistry;

  const lastImportIndex = updated.lastIndexOf('import ');
  const lastImportEnd = updated.indexOf('\n', lastImportIndex);
  updated = updated.slice(0, lastImportEnd + 1) + importLine + '\n' + updated.slice(lastImportEnd + 1);

  updated = updated.replace(/} as const;/, `${slotEntry}\n} as const;`);

  writeFileSync(slotRegistryPath, updated);
  console.log(`Updated src/slot-registry.ts`);
}

console.log(`\nGenerated component: ${name}`);
console.log(`  src/components/${kebab}/`);
console.log(`    ${name}.tsx`);
console.log(`    ${name}.test.tsx`);
console.log(`    base.ts`);
console.log(`    index.ts`);
console.log(`    types.ts`);
console.log(`\nNext steps:`);
console.log(`  1. Replace the <div> placeholder in ${name}.tsx with the real Spar primitive.`);
console.log(`  2. See src/components/accordion/ for the compound-component pattern.`);
