import type { ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type ChipVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'verified' | 'purple' | 'cyan' | 'business' | 'teal' | 'white' | 'dark';

export type ChipAppearance = 'filled' | 'filledLight' | 'outlined';

export type ChipSize = 'small' | 'base' | 'large';

export type ChipSlot = 'root' | 'label' | 'remove';

export interface ChipProps extends Omit<TakeoffHTMLProps<'span'>, 'children' | 'onSelect'> {
  /**
   * Color variant.
   * @defaultValue 'primary'
   */
  variant?: ChipVariant;
  /**
   * Visual appearance.
   * @defaultValue 'filled'
   */
  appearance?: ChipAppearance;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: ChipSize;
  /**
   * Disables interactive affordances and remove actions.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Renders a remove button that dismisses the chip from the DOM when pressed.
   * @defaultValue false
   */
  removable?: boolean;
  /**
   * Makes the chip root keyboard-focusable and button-like for click actions.
   * @defaultValue false
   */
  clickable?: boolean;
  /**
   * Whether the chip removes itself after a non-prevented remove action.
   * @defaultValue true
   */
  autoDismiss?: boolean;
  /**
   * Called when the remove button is pressed or the focused chip receives Backspace/Delete.
   */
  onRemove?: () => void;
  /**
   * Accessible label for the remove button.
   * @defaultValue 'Remove'
   */
  removeLabel?: string;
  /** Chip content. */
  children?: ReactNode;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<ChipSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<ChipSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Chip: import('../../core').ComponentThemeConfig<ChipProps, ChipSlot>;
  }
}
