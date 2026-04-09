#!/usr/bin/env node

/* eslint-disable no-console */
/* global process, console */

/**
 * Component scaffold generator for @takeoff-ui/react-spar.
 *
 * Usage:
 *   node scripts/generate-component.mjs <ComponentName>
 *
 * Example:
 *   node scripts/generate-component.mjs Tooltip
 *
 * Creates:
 *   src/components/<component-name>/
 *     <ComponentName>.tsx
 *     <ComponentName>.test.tsx
 *     <ComponentName>Base.ts
 *     types.ts
 *     index.ts
 *
 * Also updates:
 *   src/components/index.ts  (adds barrel export)
 *   src/theme/recipes.ts     (adds recipe entry)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');
const componentsDir = resolve(packageDir, 'src/components');
const recipesPath = resolve(packageDir, 'src/theme/recipes.ts');
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

// --- types.ts ---
writeFileSync(
  resolve(componentDir, 'types.ts'),
  `import type { ComponentPropsWithoutRef } from 'react';

type ${name}NativeProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export interface ${name}Props extends ${name}NativeProps {
  children?: React.ReactNode;
}
`,
);

// --- <Name>Base.ts ---
writeFileSync(
  resolve(componentDir, `${name}Base.ts`),
  `import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';

import type { ${name}Props } from './types';

export const ${camel}Slots = ['root'] as const;

export type ${name}Slot = (typeof ${camel}Slots)[number];

export const ${camel}ClassNames = {
  root: '${prefix}',
} as const satisfies SlotClassNames<${name}Slot>;

export const ${name}Base = createComponentBase<${name}Props, ${name}Slot>({
  name: '${name}',
  slots: ${camel}Slots,
  classNames: ${camel}ClassNames,
  defaultProps: {},
});
`,
);

// --- <Name>.tsx ---
writeFileSync(
  resolve(componentDir, `${name}.tsx`),
  `import { type Ref } from 'react';

import { ${name}Base } from './${name}Base';
import type { ${name}Props } from './types';

function ${name}({ ref, ...rawProps }: ${name}Props & { ref?: Ref<HTMLDivElement> }) {
  const {
    children,
    className,
    ...restProps
  } = ${name}Base.resolveProps(rawProps);

  return (
    <div
      ref={ref}
      {...restProps}
      className={${name}Base.cx('root', className)}
      data-slot="root"
    >
      {children}
    </div>
  );
}

${name}.displayName = '${name}';

export { ${name} };
`,
);

// --- <Name>.test.tsx ---
writeFileSync(
  resolve(componentDir, `${name}.test.tsx`),
  `import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ${name} } from './${name}';

describe('${name}', () => {
  describe('rendering', () => {
    it('should render with ${prefix} root class', () => {
      const { container } = render(<${name}>Content</${name}>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toBeInTheDocument();
      expect(root.className).toContain('${prefix}');
    });

    it('should set data-slot="root" on root element', () => {
      const { container } = render(<${name}>Content</${name}>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('should merge custom className', () => {
      const { container } = render(<${name} className="custom">Content</${name}>);
      const root = container.querySelector('[data-slot="root"]')!;
      expect(root.className).toContain('${prefix}');
      expect(root.className).toContain('custom');
    });
  });

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<${name}>Content</${name}>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
`,
);

// --- index.ts ---
writeFileSync(
  resolve(componentDir, 'index.ts'),
  `export * from './${name}';
export * from './types';
`,
);

// --- Update src/components/index.ts ---
const componentsIndex = readFileSync(componentsIndexPath, 'utf8');
if (!componentsIndex.includes(`./${kebab}`)) {
  const updatedIndex = componentsIndex.trimEnd() + `\nexport * from './${kebab}';\n`;
  writeFileSync(componentsIndexPath, updatedIndex);
  console.log(`Updated src/components/index.ts`);
}

// --- Update src/theme/recipes.ts ---
const recipes = readFileSync(recipesPath, 'utf8');
if (!recipes.includes(`${name}Base`)) {
  const importLine = `import { ${name}Base } from '../components/${kebab}/${name}Base';`;
  const recipeEntry = `  ${camel}: {\n    slots: ${name}Base.classes,\n  },`;

  let updated = recipes;

  // Add import after last import
  const lastImportIndex = updated.lastIndexOf('import ');
  const lastImportEnd = updated.indexOf('\n', lastImportIndex);
  updated = updated.slice(0, lastImportEnd + 1) + importLine + '\n' + updated.slice(lastImportEnd + 1);

  // Add recipe entry before closing `} as const`
  updated = updated.replace(/} as const;/, `${recipeEntry}\n} as const;`);

  writeFileSync(recipesPath, updated);
  console.log(`Updated src/theme/recipes.ts`);
}

console.log(`\nGenerated component: ${name}`);
console.log(`  src/components/${kebab}/`);
console.log(`    ${name}.tsx`);
console.log(`    ${name}.test.tsx`);
console.log(`    ${name}Base.ts`);
console.log(`    types.ts`);
console.log(`    index.ts`);
