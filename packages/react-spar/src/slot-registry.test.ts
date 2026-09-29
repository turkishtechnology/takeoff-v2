import { describe, expect, it } from 'vitest';

import { ButtonBase } from './components/button/base';
import { InputFieldBase } from './components/input/base';
import { SelectTriggerBase } from './components/select/base';
import { UploadItemActionBase } from './components/upload/base';
import * as publicApi from './index';
import { slotClassRegistry } from './slot-registry';

// `slot-registry.ts` has one runtime export: the `slotClassRegistry` object.
// Everything else in the file is imports, so these tests pin that object.

const CANONICAL_CLASS = /^tk-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const entries = Object.entries(slotClassRegistry).map(([key, { slots }]) => [key, slots as Record<string, string>] as const);

// Vite's `import.meta.glob` is available under vitest; the package tsconfig
// does not load `vite/client`, so the one call shape used here is declared.
declare global {
  interface ImportMeta {
    glob<T>(pattern: string, options: { eager: true }): Record<string, T>;
  }
}

const baseModules = import.meta.glob<Record<string, unknown>>('./components/*/base.ts', { eager: true });

describe('slotClassRegistry', () => {
  it('inventories the slot-class map of the shipped component parts', () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(slotClassRegistry.button.slots).toEqual(ButtonBase.classes);
  });

  it('inventories every createComponentBase export of every shipped component', () => {
    // The generator relies on this inventory to detect existing slot classes and
    // avoid collisions, so a base that ships without a registry entry silently
    // weakens that check. Walk every `components/<name>/base.ts` and require each
    // `*Base` export's live `classes` object to be registered.
    const registered = new Set<object>(Object.values(slotClassRegistry).map(({ slots }) => slots));
    const missing: string[] = [];
    expect(Object.keys(baseModules).length).toBeGreaterThan(0);
    for (const [path, module] of Object.entries(baseModules)) {
      for (const [name, value] of Object.entries(module)) {
        if (!name.endsWith('Base') || typeof value !== 'object' || value === null || !('classes' in value)) continue;
        if (!registered.has((value as { classes: object }).classes)) missing.push(`${path} → ${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('points each entry at the live classes of its base rather than a copy', () => {
    // The generator appends `<camel>: { slots: <Name>Base.classes }`; a copy would drift from the base.
    expect(slotClassRegistry.button.slots).toBe(ButtonBase.classes);
    expect(slotClassRegistry.inputField.slots).toBe(InputFieldBase.classes);
    expect(slotClassRegistry.selectTrigger.slots).toBe(SelectTriggerBase.classes);
    expect(slotClassRegistry.uploadItemAction.slots).toBe(UploadItemActionBase.classes);
  });

  it('keys entries in lower camelCase, the shape the generator writes', () => {
    for (const [key] of entries) {
      expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    }
  });

  it('gives every entry a root slot', () => {
    for (const [key, slots] of entries) {
      expect(slots, key).toHaveProperty('root');
    }
  });

  it('holds only canonical tk-* classes or the empty strings createComponentBase allows', () => {
    for (const [key, slots] of entries) {
      for (const [slot, className] of Object.entries(slots)) {
        expect(className === '' || CANONICAL_CLASS.test(className), `${key}.${slot} = "${className}"`).toBe(true);
      }
    }
  });

  it('stays out of the package entry point', () => {
    expect(publicApi).not.toHaveProperty('slotClassRegistry');
  });
});
