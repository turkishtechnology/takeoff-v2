#!/usr/bin/env node

/* eslint-disable no-console */

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
  `import type { ElementType } from 'react';
// TODO: import the matching Spar prop type alongside PolymorphicProps:
// import type { ${name}Props as Spar${name}Props, PolymorphicProps } from '@turkish-technology/spar';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type ${name}Slot = 'root';

/**
 * Visual + slot props owned by takeoff-v2 (not exposed by Spar).
 * Declaring \`classNames\`/\`slotProps\` here means PolymorphicProps' built-in
 * \`keyof Props\` omit cleans them off the native element automatically.
 */
export interface ${name}OwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<${name}Slot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<${name}Slot>;
}

/**
 * Public props for ${name}. Polymorphic via \`as\` (e.g. render as a different
 * element). Ref and native attributes of the rendered element are inherited
 * from Spar's \`PolymorphicProps\`.
 */
// TODO: intersect a Pick<Spar${name}Props, '...'> clause inside the third
// generic argument below, listing only the Spar behavior props this wrapper
// intentionally exposes. Above the Pick<>, write a 1–3 line intent comment
// naming what is EXCLUDED and why — that is the rationale future readers
// need. Example:
//
//   export type ${name}Props<T extends ElementType = 'div'> = PolymorphicProps<
//     'div',
//     T,
//     ${name}OwnProps &
//       // Spar behavior surface this wrapper exposes. Visual concerns are in
//       // ${name}OwnProps above, not picked.
//       Pick<Spar${name}Props, 'foo' | 'bar' | 'onBaz'>
//   >;
//
// See docs/component-authoring-contract.md#public-type-boundary for the rule
// and #polymorphism-as-prop-no-aschild for the polymorphic wrapper template.
export type ${name}Props<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  ${name}OwnProps
>;

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
  `import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ${name}Base } from './base';
import type { ${name}Props } from './types';

// TODO: wire to the matching Spar primitive (e.g. <Spar${name}>) and extend
// ${name}Props with its public surface (Pick clause in types.ts). Until then
// this renders a plain <div>.
//
// The component is generic so consumers can pass \`as\` for polymorphism. The
// inner cast to ${name}Props<'div'> stabilizes destructuring; the consumer's
// T is preserved at the call site via the prop type.
export const ${name} = <T extends ElementType = 'div'>(props: ${name}Props<T>) => {
  const theme = useComponentTheme('${name}');
  const { rootAttrs, rest } = composeRootAttrs(${name}Base, props as ${name}Props<'div'>, theme);
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

  // Find the last real `import ... from '...';` at line start. Using
  // `lastIndexOf('import ')` would also match the word "import" appearing
  // inside JSDoc prose, leading to an import line inserted mid-comment.
  const importLineRegex = /^import\b[^\n]*from\s+['"][^'"]+['"];?[^\n]*$/gm;
  let lastMatch = null;
  let m;
  while ((m = importLineRegex.exec(updated)) !== null) {
    lastMatch = m;
  }
  const lastImportEnd = lastMatch ? lastMatch.index + lastMatch[0].length : 0;
  updated = updated.slice(0, lastImportEnd) + '\n' + importLine + updated.slice(lastImportEnd);

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
console.log(`  2. In types.ts, intersect a Pick<Spar${name}Props, '...'> clause inside the`);
console.log(`     PolymorphicProps third generic, with an intent comment above it naming`);
console.log(`     what is EXCLUDED and why.`);
console.log(`     (See docs/component-authoring-contract.md — sections #public-type-boundary,`);
console.log(`     #polymorphism-as-prop-no-aschild, #render-prop-children-where-spar-provides-them.)`);
console.log(`  3. If Spar exposes function-as-children on this component (typical for Trigger/Close`);
console.log(`     parts), add 'children' to the Pick<>. Skip it if the wrapper has invariant chrome.`);
console.log(`  4. Run: pnpm --filter @takeoff-ui/react-spar lint:spar-pick (CI guard).`);
console.log(`  5. See src/components/accordion/ for the compound-component pattern.`);
