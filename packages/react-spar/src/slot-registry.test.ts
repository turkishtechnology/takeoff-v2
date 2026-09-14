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

describe('slotClassRegistry', () => {
  it('inventories the slot-class map of the shipped component parts', () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(slotClassRegistry.button.slots).toEqual(ButtonBase.classes);
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
