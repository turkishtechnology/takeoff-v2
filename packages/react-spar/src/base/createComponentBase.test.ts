import { describe, it, expect } from 'vitest';
import { createComponentBase } from './createComponentBase';

describe('createComponentBase', () => {
  const base = createComponentBase<'root' | 'label'>({ root: 'tk-test', label: 'tk-test-label' });

  it('exposes the classes map', () => {
    expect(base.classes.root).toBe('tk-test');
    expect(base.classes.label).toBe('tk-test-label');
  });

  describe('getSlotProps', () => {
    it('returns className and data-slot for a simple slot', () => {
      const result = base.getSlotProps('root');
      expect(result.className).toBe('tk-test');
      expect(result['data-slot']).toBe('root');
    });

    it('converts camelCase slot to kebab-case data-slot', () => {
      const camelBase = createComponentBase<'root' | 'leadingIcon'>({ root: 'tk-camel', leadingIcon: 'tk-camel-leading-icon' });
      const result = camelBase.getSlotProps('leadingIcon');
      expect(result['data-slot']).toBe('leading-icon');
      expect(result.className).toBe('tk-camel-leading-icon');
    });

    it('merges extra className', () => {
      const result = base.getSlotProps('root', { className: 'custom' });
      expect(result.className).toBe('tk-test custom');
    });

    it('handles falsy extra className', () => {
      const result = base.getSlotProps('root', { className: false });
      expect(result.className).toBe('tk-test');
    });

    it('passes through extra props', () => {
      const result = base.getSlotProps('root', { 'aria-hidden': 'true', 'role': 'presentation' });
      expect(result['aria-hidden']).toBe('true');
      expect(result.role).toBe('presentation');
    });

    it('works with no extra argument', () => {
      const result = base.getSlotProps('label');
      expect(result.className).toBe('tk-test-label');
      expect(result['data-slot']).toBe('label');
    });
  });
});
