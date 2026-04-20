import { describe, it, expect } from 'vitest';

import { resolveSlotClass } from './slotClass';

describe('resolveSlotClass', () => {
  it('returns the canonical class when no other layer is supplied', () => {
    expect(resolveSlotClass('tk-foo', undefined, undefined)).toBe('tk-foo');
  });

  it('concatenates layers in canonical → instance → theme order', () => {
    expect(resolveSlotClass('tk-foo', 'inst', 'theme')).toBe('tk-foo inst theme');
  });

  it('skips undefined layers', () => {
    expect(resolveSlotClass('tk-foo', undefined, 'theme')).toBe('tk-foo theme');
  });

  it('filters out empty canonical (e.g. AccordionHeader)', () => {
    expect(resolveSlotClass('', 'inst', undefined)).toBe('inst');
  });

  it('returns empty string when every layer is empty', () => {
    expect(resolveSlotClass('', undefined, undefined)).toBe('');
  });
});
