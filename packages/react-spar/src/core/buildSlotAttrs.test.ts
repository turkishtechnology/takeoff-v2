import { describe, expect, it } from 'vitest';

import { buildSlotAttrs } from './buildSlotAttrs';

describe('buildSlotAttrs', () => {
  it('returns canonical attrs verbatim when no theme or instance overrides are supplied', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': 'tk-foo' }, 'root');
    expect(out).toEqual({ 'data-slot': 'root', 'className': 'tk-foo' });
  });

  it('composes className canonical → theme → instance', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': 'tk-foo inst-root' }, 'root', {
      themeClassName: 'theme-class',
      instanceClassNames: { root: 'instance-class' },
    });
    expect(out.className).toBe('tk-foo inst-root theme-class instance-class');
  });

  it('reads themeClassNames per slot when provided, falling back to themeClassName for root', () => {
    const out = buildSlotAttrs<'root' | 'arrow', { 'className'?: string; 'data-slot': 'root' | 'arrow' }>({ 'data-slot': 'arrow', 'className': 'tk-arrow' }, 'arrow', {
      themeClassNames: { arrow: 'theme-arrow' },
      themeClassName: 'theme-root',
    });
    expect(out.className).toBe('tk-arrow theme-arrow');
  });

  it('shallow-merges theme slotProps below canonical, keyed by slot', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root'; 'id'?: string; 'aria-label'?: string }>(
      { 'data-slot': 'root', 'className': 'tk-foo', 'id': 'instance-id' },
      'root',
      {
        themeSlotProps: { root: { 'id': 'theme-id', 'aria-label': 'from theme' }, other: { id: 'unrelated' } } as never,
      },
    );
    expect(out.id).toBe('instance-id');
    expect(out['aria-label']).toBe('from theme');
    expect(out['data-slot']).toBe('root');
  });

  it('overrides theme slotProps with instance slotProps for non-canonical keys', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root'; 'aria-label'?: string }>({ 'data-slot': 'root', 'className': 'tk-foo' }, 'root', {
      themeSlotProps: { root: { 'aria-label': 'from theme' } },
      instanceSlotProps: { root: { 'aria-label': 'from instance' } },
    });
    expect(out['aria-label']).toBe('from instance');
  });

  it('keeps canonical data-slot when both theme and instance try to override it', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': 'tk-foo' }, 'root', {
      themeSlotProps: { root: { 'data-slot': 'theme-bogus' } } as never,
      instanceSlotProps: { root: { 'data-slot': 'instance-bogus' } } as never,
    });
    expect(out['data-slot']).toBe('root');
  });

  it('does not pull from theme when the slotKey is missing from the map', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root'; 'id'?: string }>({ 'data-slot': 'root', 'className': 'tk-foo' }, 'root', {
      themeSlotProps: { other: { id: 'x' } } as never,
    });
    expect(out.id).toBeUndefined();
  });

  it('returns className=undefined when every layer is empty', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': undefined }, 'root');
    expect(out.className).toBeUndefined();
  });
});
