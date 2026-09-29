import type { ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type ChipVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'verified' | 'purple' | 'cyan' | 'business' | 'teal' | 'white' | 'dark';

export type ChipAppearance = 'filled' | 'filledLight' | 'outlined';

export type ChipSize = 'small' | 'base' | 'large';

export type ChipSlot = 'root' | 'label' | 'remove';

export interface ChipProps extends Omit<TakeoffHTMLProps<'span'>, 'children'> {
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
   * Disables interactive affordances and remove actions, and keeps the chip
   * out of the tab order (a `tabIndex` given to a disabled chip resolves to
   * `-1`).
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Renders a remove button that dismisses the chip from the DOM when pressed.
   * @defaultValue false
   */
  removable?: boolean;
  /**
   * Makes the chip keyboard-focusable and button-like for click actions. The
   * root carries the action; when the chip is also `removable`, the action
   * moves onto the label slot so the remove button stays a sibling control
   * that keyboard and assistive-tech users can reach separately.
   * @defaultValue false
   */
  clickable?: boolean;
  /**
   * Whether the chip removes itself from the DOM after a remove action.
   *
   * Removal is tracked in internal state, so set `autoDismiss={false}` when the
   * parent owns the chip list (e.g. renders chips from an array) and let
   * `onRemove` drive the parent's state — otherwise the chip and the parent's
   * list become two sources of truth.
   * @defaultValue true
   */
  autoDismiss?: boolean;
  /**
   * Called when the remove button is pressed or a focused clickable chip
   * receives Backspace/Delete. The remove button's click never doubles as the
   * chip's `onClick`.
   */
  onRemove?: () => void;
  /** Chip content. */
  children?: ReactNode;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<ChipSlot>;
  /**
   * Per-slot HTML-attribute overrides. `root.role` / `root.tabIndex` describe
   * the click action and follow it onto whichever node carries it (the root,
   * or the label of a clickable removable chip); they resolve as instance
   * `role` / `tabIndex` → `slotProps.root` → wrapper default.
   */
  slotProps?: SlotPropsMap<ChipSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Chip: import('../../core').ComponentThemeConfig<ChipProps, ChipSlot>;
  }
}
