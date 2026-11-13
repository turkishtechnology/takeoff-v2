import { describe, expect, it } from 'vitest';

import { resolveLabels } from './resolveLabels';

type Labels = { title: string; hint?: string };
const DEFAULTS: Labels = { title: 'Title', hint: undefined };

describe('resolveLabels', () => {
  it('returns the defaults when no layer is given', () => {
    expect(resolveLabels(DEFAULTS)).toEqual(DEFAULTS);
    expect(resolveLabels(DEFAULTS, undefined)).toEqual(DEFAULTS);
  });

  it('merges layers key by key, later layers winning', () => {
    expect(resolveLabels(DEFAULTS, { title: 'Başlık', hint: 'İpucu' }, { title: 'Ad' })).toEqual({ title: 'Ad', hint: 'İpucu' });
  });

  it('falls back for empty, whitespace-only and non-string values', () => {
    const loose = { title: '  ', hint: 42 } as unknown as Partial<Labels>;
    expect(resolveLabels(DEFAULTS, { title: 'Başlık' }, { title: '' }, loose)).toEqual({ title: 'Başlık', hint: undefined });
  });

  it('drops keys the defaults do not declare', () => {
    expect(resolveLabels(DEFAULTS, { extra: 'x' } as Partial<Labels>)).not.toHaveProperty('extra');
  });

  it('does not mutate the defaults', () => {
    resolveLabels(DEFAULTS, { title: 'Başlık' });
    expect(DEFAULTS.title).toBe('Title');
  });
});
