import { describe, expect, expectTypeOf, it } from 'vitest';

import { createComponentBase, type DataSlotName } from './createComponentBase';

interface DemoProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  tone?: 'neutral' | 'brand';
  className?: string;
}

type DemoSlot = 'root' | 'startContent' | 'closeButtonIcon' | 'decoration';

const DEMO_CLASSES = {
  root: 'tk-demo',
  startContent: 'tk-demo-start-content',
  closeButtonIcon: 'tk-demo-close-button-icon',
  decoration: '',
} as const;

const createDemoBase = (defaultProps?: Partial<DemoProps>) =>
  createComponentBase<DemoProps, DemoSlot>({
    name: 'Demo',
    slots: ['root', 'startContent', 'closeButtonIcon', 'decoration'],
    classes: DEMO_CLASSES,
    defaultProps,
  });

describe('createComponentBase', () => {
  describe('base descriptor', () => {
    it('exposes the configured name, slots and canonical classes', () => {
      const base = createDemoBase();

      expect(base.name).toBe('Demo');
      expect(base.slots).toEqual(['root', 'startContent', 'closeButtonIcon', 'decoration']);
      expect(base.classes).toEqual(DEMO_CLASSES);
    });

    it('defaults the author defaultProps to an empty object', () => {
      expect(createDemoBase().defaultProps).toEqual({});
    });

    it('keeps the author defaultProps it was given', () => {
      expect(createDemoBase({ variant: 'primary' }).defaultProps).toEqual({ variant: 'primary' });
    });
  });

  describe('getSlotProps', () => {
    it('emits the data-slot hook and the canonical tk-* class for a slot', () => {
      expect(createDemoBase().getSlotProps('root')).toEqual({ 'data-slot': 'root', 'className': 'tk-demo' });
    });

    it('kebab-cases camelCase slot keys into the data-slot value', () => {
      const base = createDemoBase();

      expect(base.getSlotProps('startContent')['data-slot']).toBe('start-content');
      expect(base.getSlotProps('closeButtonIcon')['data-slot']).toBe('close-button-icon');
      expectTypeOf<DataSlotName<'closeButtonIcon'>>().toEqualTypeOf<'close-button-icon'>();
      expectTypeOf<DataSlotName<'root'>>().toEqualTypeOf<'root'>();
    });

    it('appends an instance className after the canonical class', () => {
      expect(createDemoBase().getSlotProps('root', { className: 'extra' }).className).toBe('tk-demo extra');
    });

    it('omits className when the slot has no canonical class and no instance class', () => {
      const attrs = createDemoBase().getSlotProps('decoration');

      expect(attrs.className).toBeUndefined();
      expect(attrs['data-slot']).toBe('decoration');
    });

    it('uses only the instance class when the canonical class is empty', () => {
      expect(createDemoBase().getSlotProps('decoration', { className: 'extra' }).className).toBe('extra');
    });

    it('forwards every other attribute untouched', () => {
      const onClick = () => {};
      const attrs = createDemoBase().getSlotProps('root', { 'id': 'demo', 'aria-label': 'Demo', onClick, 'className': 'extra' });

      expect(attrs).toEqual({ 'id': 'demo', 'aria-label': 'Demo', onClick, 'data-slot': 'root', 'className': 'tk-demo extra' });
      expect(attrs.onClick).toBe(onClick);
    });

    it('keeps the canonical data-slot when the attrs try to override it', () => {
      const attrs: { 'className'?: string; 'data-slot'?: string } = { 'data-slot': 'hijacked' };

      expect(createDemoBase().getSlotProps('startContent', attrs)['data-slot']).toBe('start-content');
    });

    it('does not mutate the attrs object it receives', () => {
      const attrs = { className: 'extra', id: 'demo' };
      createDemoBase().getSlotProps('root', attrs);

      expect(attrs).toEqual({ className: 'extra', id: 'demo' });
    });
  });

  describe('resolveProps', () => {
    it('falls back to author defaults when neither theme nor instance set a prop', () => {
      const base = createDemoBase({ variant: 'primary', size: 'medium' });

      expect(base.resolveProps({})).toEqual({ variant: 'primary', size: 'medium' });
    });

    it('lets theme defaults override author defaults', () => {
      const base = createDemoBase({ variant: 'primary', size: 'medium' });

      expect(base.resolveProps({}, { size: 'large' })).toEqual({ variant: 'primary', size: 'large' });
    });

    it('lets instance props override both theme and author defaults', () => {
      const base = createDemoBase({ variant: 'primary', size: 'medium' });

      expect(base.resolveProps({ variant: 'secondary', size: 'small' }, { variant: 'primary', size: 'large' })).toEqual({ variant: 'secondary', size: 'small' });
    });

    it('layers each key independently across author, theme and instance', () => {
      const base = createDemoBase({ variant: 'primary', size: 'medium', tone: 'neutral' });

      expect(base.resolveProps({ variant: 'secondary' }, { size: 'large' })).toEqual({ variant: 'secondary', size: 'large', tone: 'neutral' });
    });

    it('keeps instance props that have no default in any layer', () => {
      expect(createDemoBase().resolveProps({ className: 'extra' })).toEqual({ className: 'extra' });
    });

    it('returns a fresh object without mutating any layer', () => {
      const base = createDemoBase({ variant: 'primary' });
      const themeDefaults: Partial<DemoProps> = { size: 'large' };
      const props: Partial<DemoProps> = { tone: 'brand' };

      const merged = base.resolveProps(props, themeDefaults);

      expect(merged).not.toBe(props);
      expect(merged).toEqual({ variant: 'primary', size: 'large', tone: 'brand' });
      expect(props).toEqual({ tone: 'brand' });
      expect(themeDefaults).toEqual({ size: 'large' });
      expect(base.defaultProps).toEqual({ variant: 'primary' });
    });
  });
});
