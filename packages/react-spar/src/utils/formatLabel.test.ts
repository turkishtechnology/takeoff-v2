import { describe, expect, it } from 'vitest';

import { formatLabel } from './index';

describe('formatLabel', () => {
  it('fills every occurrence of each known placeholder', () => {
    expect(formatLabel('{name} — {name} ({size})', { name: 'a.pdf', size: 3 })).toBe('a.pdf — a.pdf (3)');
  });

  it('leaves unknown and prototype-named placeholders as written', () => {
    expect(formatLabel('{page} {constructor} {nope}', { page: 2 })).toBe('2 {constructor} {nope}');
  });

  it('does not re-scan or interpret substituted values', () => {
    expect(formatLabel('Remove {name}', { name: '{name} $& $1.pdf' })).toBe('Remove {name} $& $1.pdf');
  });

  it('returns a template with no placeholders unchanged', () => {
    expect(formatLabel('Remove file', { name: 'a.pdf' })).toBe('Remove file');
  });
});
