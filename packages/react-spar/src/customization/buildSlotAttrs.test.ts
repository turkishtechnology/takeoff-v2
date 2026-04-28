import { describe, expect, it } from 'vitest';

import { buildSlotAttrs } from './buildSlotAttrs';

describe('buildSlotAttrs', () => {
  it('returns canonical attrs verbatim when no theme overrides are supplied', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': 'tk-foo' }, undefined, 'root', undefined);
    expect(out).toEqual({ 'data-slot': 'root', 'className': 'tk-foo' });
  });

  it('appends theme classNames after the canonical (canonical → theme)', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': 'tk-foo inst' }, undefined, 'root', 'theme-class');
    expect(out.className).toBe('tk-foo inst theme-class');
  });

  it('shallow-merges theme slotProps below canonical, keyed by slot', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root'; 'id'?: string; 'aria-label'?: string }>(
      { 'data-slot': 'root', 'className': 'tk-foo', 'id': 'instance-id' },
      { root: { 'id': 'theme-id', 'aria-label': 'from theme' }, other: { id: 'unrelated' } } as never,
      'root',
      undefined,
    );
    expect(out.id).toBe('instance-id');
    expect(out['aria-label']).toBe('from theme');
    expect(out['data-slot']).toBe('root');
  });

  it('does not pull from theme when the slotKey is missing from the map', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root'; 'id'?: string }>(
      { 'data-slot': 'root', 'className': 'tk-foo' },
      { other: { id: 'x' } } as never,
      'root',
      undefined,
    );
    expect(out.id).toBeUndefined();
  });

  it('returns className=undefined when every layer is empty', () => {
    const out = buildSlotAttrs<'root', { 'className'?: string; 'data-slot': 'root' }>({ 'data-slot': 'root', 'className': undefined }, undefined, 'root', undefined);
    expect(out.className).toBeUndefined();
  });
});
