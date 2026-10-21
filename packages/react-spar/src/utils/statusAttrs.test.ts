import { describe, expect, it } from 'vitest';

import { getStatusAttrs } from './statusAttrs';

describe('getStatusAttrs', () => {
  it('defaults to a status role with the default name', () => {
    expect(getStatusAttrs({}, 'Loading')).toEqual({ 'role': 'status', 'aria-label': 'Loading' });
  });

  it('keeps an explicit role and aria-label', () => {
    expect(getStatusAttrs({ 'role': 'progressbar', 'aria-label': 'Saving' }, 'Loading')).toEqual({ 'role': 'progressbar', 'aria-label': 'Saving' });
  });

  it('drops the default name when aria-labelledby is set', () => {
    expect(getStatusAttrs({ 'aria-labelledby': 'label-id' }, 'Loading')).toEqual({ 'role': 'status', 'aria-label': undefined });
  });

  it.each([true, 'true'] as const)('returns nothing for aria-hidden=%s', ariaHidden => {
    expect(getStatusAttrs({ 'aria-hidden': ariaHidden }, 'Loading')).toEqual({});
  });
});
