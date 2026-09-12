import type { HTMLAttributes } from 'react';
import { describe, expect, it } from 'vitest';

import { buildSlotAttrs } from './buildSlotAttrs';
import { createComponentBase } from './createComponentBase';
import type { ClassNamesMap, SlotPropsMap } from './types';

type CardSlot = 'root' | 'icon' | 'title';

const CardBase = createComponentBase<object, CardSlot>({
  name: 'Card',
  slots: ['root', 'icon', 'title'],
  classes: { root: 'tk-card', icon: 'tk-card-icon', title: 'tk-card-title' },
});

describe('buildSlotAttrs', () => {
  describe('canonical attrs', () => {
    it('returns the canonical data-slot and tk-* class when no layers are given', () => {
      expect(buildSlotAttrs(CardBase.getSlotProps('icon'), 'icon')).toEqual({ 'data-slot': 'icon', 'className': 'tk-card-icon' });
    });

    it('returns a new object and leaves the canonical attrs untouched', () => {
      const canonical = CardBase.getSlotProps('title');
      const before = { ...canonical };

      const result = buildSlotAttrs(canonical, 'title', {
        instanceClassNames: { title: 'instance-title' },
        instanceSlotProps: { title: { id: 'instance-title' } },
      });

      expect(result).not.toBe(canonical);
      expect(canonical).toEqual(before);
    });

    it('leaves className undefined instead of emitting an empty class when every class source is empty', () => {
      const result = buildSlotAttrs({ className: '' }, 'root', {
        themeClassNames: { root: '' },
        instanceClassNames: { root: '' },
      });

      expect(result.className).toBeUndefined();
    });
  });

  describe('className merge order', () => {
    it('concatenates the canonical, theme and instance classes in that order', () => {
      const { className } = buildSlotAttrs(CardBase.getSlotProps('title'), 'title', {
        themeClassNames: { title: 'theme-title' },
        instanceClassNames: { title: 'instance-title' },
      });

      expect(className).toBe('tk-card-title theme-title instance-title');
    });

    it('treats the provider className shortcut as the theme class of the root slot', () => {
      const { className } = buildSlotAttrs(CardBase.getSlotProps('root'), 'root', {
        themeClassName: 'product-card',
        instanceClassNames: { root: 'instance-card' },
      });

      expect(className).toBe('tk-card product-card instance-card');
    });

    it('still adds the theme and instance classes when the canonical class is empty', () => {
      const { className } = buildSlotAttrs({ className: undefined }, 'root', { themeClassName: 'product-card', instanceClassNames: { root: 'instance-card' } });

      expect(className).toBe('product-card instance-card');
    });

    it('does not apply the provider className shortcut to non-root slots', () => {
      const { className } = buildSlotAttrs(CardBase.getSlotProps('icon'), 'icon', { themeClassName: 'product-card' });

      expect(className).toBe('tk-card-icon');
    });

    it('ignores classes declared for other slots', () => {
      const themeClassNames: ClassNamesMap<CardSlot> = { root: 'theme-root', title: 'theme-title' };
      const instanceClassNames: ClassNamesMap<CardSlot> = { root: 'instance-root', title: 'instance-title' };

      const { className } = buildSlotAttrs(CardBase.getSlotProps('icon'), 'icon', { themeClassNames, instanceClassNames });

      expect(className).toBe('tk-card-icon');
    });
  });

  describe('slotProps merge', () => {
    it('applies the theme slotProps for the slot', () => {
      const result = buildSlotAttrs(CardBase.getSlotProps('title'), 'title', {
        themeSlotProps: { title: { 'id': 'theme-title', 'aria-live': 'polite' } },
      });

      expect(result).toEqual({ 'id': 'theme-title', 'aria-live': 'polite', 'data-slot': 'title', 'className': 'tk-card-title' });
    });

    it('lets instance slotProps win over theme slotProps on conflicting keys', () => {
      const result = buildSlotAttrs(CardBase.getSlotProps('title'), 'title', {
        themeSlotProps: { title: { id: 'theme-title', title: 'Theme tooltip' } },
        instanceSlotProps: { title: { id: 'instance-title' } },
      });

      expect(result).toMatchObject({ id: 'instance-title', title: 'Theme tooltip' });
    });

    it('merges shallowly, so an instance style object replaces the theme style object', () => {
      const result = buildSlotAttrs(CardBase.getSlotProps('root'), 'root', {
        themeSlotProps: { root: { style: { color: 'red', margin: 4 } } },
        instanceSlotProps: { root: { style: { padding: 8 } } },
      });

      expect(result).toMatchObject({ style: { padding: 8 } });
      expect(result).not.toMatchObject({ style: { color: 'red' } });
    });

    it('keeps the canonical attrs authoritative over theme and instance slotProps', () => {
      const canonicalIconAttrs: HTMLAttributes<HTMLSpanElement> = { 'aria-hidden': true };
      const override = { 'id': 'icon', 'data-slot': 'hijacked', 'aria-hidden': false } as HTMLAttributes<HTMLElement>;
      const slotProps: SlotPropsMap<CardSlot> = { icon: override };

      const result = buildSlotAttrs(CardBase.getSlotProps('icon', canonicalIconAttrs), 'icon', {
        themeSlotProps: slotProps,
        instanceSlotProps: slotProps,
      });

      expect(result).toMatchObject({ 'id': 'icon', 'data-slot': 'icon', 'aria-hidden': true });
    });

    it('keeps the theme slotProps of a slot the instance map does not target', () => {
      const themeSlotProps: SlotPropsMap<CardSlot> = { title: { id: 'theme-title' } };
      const instanceSlotProps: SlotPropsMap<CardSlot> = { root: { id: 'instance-root' } };

      const result = buildSlotAttrs(CardBase.getSlotProps('title'), 'title', { themeSlotProps, instanceSlotProps });

      expect(result).toEqual({ 'id': 'theme-title', 'data-slot': 'title', 'className': 'tk-card-title' });
    });

    it('ignores slotProps declared for other slots', () => {
      const themeSlotProps: SlotPropsMap<CardSlot> = { root: { id: 'theme-root' } };
      const instanceSlotProps: SlotPropsMap<CardSlot> = { title: { title: 'Instance title' } };

      const result = buildSlotAttrs(CardBase.getSlotProps('icon'), 'icon', { themeSlotProps, instanceSlotProps });

      expect(result).toEqual({ 'data-slot': 'icon', 'className': 'tk-card-icon' });
    });
  });
});
