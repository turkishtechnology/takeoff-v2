import { describe, it, expect } from 'vitest';
import { createComponentBase } from './createComponentBase';

describe('createComponentBase', () => {
  const base = createComponentBase<{ size: string; disabled: boolean }, 'root' | 'label'>({
    name: 'Test',
    slots: ['root', 'label'],
    classNames: { root: 'tk-test', label: 'tk-test-label' },
    defaultProps: { size: 'base', disabled: false },
  });

  it('should return the component name', () => {
    expect(base.name).toBe('Test');
  });

  it('should freeze slots', () => {
    expect(Object.isFrozen(base.slots)).toBe(true);
    expect(base.slots).toEqual(['root', 'label']);
  });

  it('should freeze classes', () => {
    expect(Object.isFrozen(base.classes)).toBe(true);
    expect(base.classes.root).toBe('tk-test');
    expect(base.classes.label).toBe('tk-test-label');
  });

  it('should freeze defaultProps', () => {
    expect(Object.isFrozen(base.defaultProps)).toBe(true);
    expect(base.defaultProps.size).toBe('base');
    expect(base.defaultProps.disabled).toBe(false);
  });

  describe('cx', () => {
    it('should return slot class when called with slot name only', () => {
      expect(base.cx('root')).toBe('tk-test');
    });

    it('should merge slot class with additional classes', () => {
      expect(base.cx('root', 'custom')).toBe('tk-test custom');
    });

    it('should handle falsy values', () => {
      expect(base.cx('root', false, null, undefined, 'extra')).toBe('tk-test extra');
    });
  });

  describe('resolveProps', () => {
    it('should fill undefined values with defaults', () => {
      const result = base.resolveProps({});
      expect(result.size).toBe('base');
      expect(result.disabled).toBe(false);
    });

    it('should not override explicit values', () => {
      const result = base.resolveProps({ size: 'large' });
      expect(result.size).toBe('large');
    });

    it('should not override explicit falsy values', () => {
      const result = base.resolveProps({ size: '' as string, disabled: false });
      expect(result.size).toBe('');
      expect(result.disabled).toBe(false);
    });

    it('should preserve additional props not in defaults', () => {
      const result = base.resolveProps({ size: 'large', extra: true } as Record<string, unknown>);
      expect((result as Record<string, unknown>).extra).toBe(true);
    });
  });

  describe('getSlotProps', () => {
    it('should return className and data-slot for simple slot', () => {
      const result = base.getSlotProps('root');
      expect(result.className).toBe('tk-test');
      expect(result['data-slot']).toBe('root');
    });

    it('should convert camelCase slot to kebab-case data-slot', () => {
      const camelBase = createComponentBase<object, 'root' | 'leadingIcon'>({
        name: 'Camel',
        slots: ['root', 'leadingIcon'],
        classNames: { root: 'tk-camel', leadingIcon: 'tk-camel-leading-icon' },
      });
      const result = camelBase.getSlotProps('leadingIcon');
      expect(result['data-slot']).toBe('leading-icon');
      expect(result.className).toBe('tk-camel-leading-icon');
    });

    it('should merge extra className', () => {
      const result = base.getSlotProps('root', { className: 'custom' });
      expect(result.className).toBe('tk-test custom');
    });

    it('should handle falsy extra className', () => {
      const result = base.getSlotProps('root', { className: false });
      expect(result.className).toBe('tk-test');
    });

    it('should pass through extra props', () => {
      const result = base.getSlotProps('root', { 'aria-hidden': 'true', 'role': 'presentation' });
      expect(result['aria-hidden']).toBe('true');
      expect(result.role).toBe('presentation');
    });

    it('should work with no extra argument', () => {
      const result = base.getSlotProps('label');
      expect(result.className).toBe('tk-test-label');
      expect(result['data-slot']).toBe('label');
    });
  });
});
