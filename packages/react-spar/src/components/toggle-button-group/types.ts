import type { ElementType, ReactNode } from 'react';
import type { PolymorphicProps, ToggleGroupItemProps as SparToggleGroupItemProps, ToggleGroupProps as SparToggleGroupProps, ToggleGroupValue } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type { ToggleGroupValue as ToggleButtonGroupValue };

/** Group surface: transparent, bordered, or a light filled track. */
export type ToggleButtonGroupType = 'basic' | 'divided' | 'light';

export type ToggleButtonGroupSize = 'small' | 'base' | 'large';

/** Colour of a pressed item. */
export type ToggleButtonGroupVariant = 'neutral' | 'primary';

/** How a pressed item is drawn. An item that is not pressed is always transparent. */
export type ToggleButtonGroupAppearance = 'filled' | 'filledLight' | 'outlined' | 'text' | 'raised';

export type ToggleButtonGroupSlot = 'root';

export type ToggleButtonGroupItemSlot = 'root' | 'content' | 'label';

export interface ToggleButtonGroupOwnProps {
  /**
   * Group surface.
   * @defaultValue 'basic'
   */
  type?: ToggleButtonGroupType;
  /**
   * Pill-shaped group and items.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Size scale. Cascades to every `ToggleButtonGroup.Item`; an item's own
   * `size` wins.
   * @defaultValue 'base'
   */
  size?: ToggleButtonGroupSize;
  /**
   * Colour of a pressed item. Cascades to every item; an item's own
   * `variant` wins.
   * @defaultValue 'neutral'
   */
  variant?: ToggleButtonGroupVariant;
  /**
   * How a pressed item is drawn. Cascades to every item; an item's own
   * `appearance` wins.
   * @defaultValue 'filled'
   */
  appearance?: ToggleButtonGroupAppearance;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ToggleButtonGroupSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ToggleButtonGroupSlot>;
}

export type ToggleButtonGroupProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  ToggleButtonGroupOwnProps &
    // Spar ToggleGroup selection state, release rule, group disable and the
    // navigation axis. Keyboard, roving focus and ARIA are Spar-owned and have
    // no props; `children`, `as` and native attrs flow through PolymorphicProps.
    Pick<SparToggleGroupProps, 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'deselectable' | 'disabled' | 'orientation'>
>;

export interface ToggleButtonGroupItemOwnProps {
  /**
   * Size scale for this item.
   * @defaultValue inherited from the group
   */
  size?: ToggleButtonGroupSize;
  /**
   * Pressed colour for this item.
   * @defaultValue inherited from the group
   */
  variant?: ToggleButtonGroupVariant;
  /**
   * Pressed drawing for this item.
   * @defaultValue inherited from the group
   */
  appearance?: ToggleButtonGroupAppearance;
  /**
   * Content before the label — typically an icon. Wrapped in the `content`
   * slot. An item with no children is icon-only: give it an `aria-label`.
   */
  startContent?: ReactNode;
  /** Content after the label. Wrapped in the `content` slot. */
  endContent?: ReactNode;
  /** The label, wrapped in the `label` slot. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ToggleButtonGroupItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ToggleButtonGroupItemSlot>;
}

export type ToggleButtonGroupItemProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  ToggleButtonGroupItemOwnProps &
    // Spar item identity and per-item disable. The pressed state belongs to the
    // group, so Spar Button's toggle props are not part of the item surface.
    Pick<SparToggleGroupItemProps, 'value' | 'disabled'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    ToggleButtonGroup: import('../../core').ComponentThemeConfig<ToggleButtonGroupProps, ToggleButtonGroupSlot>;
    ToggleButtonGroupItem: import('../../core').ComponentThemeConfig<ToggleButtonGroupItemProps, ToggleButtonGroupItemSlot>;
  }
}
