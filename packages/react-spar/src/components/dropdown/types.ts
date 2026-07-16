import type { ElementType } from 'react';
import type {
  DropdownMenuArrowProps as SparDropdownMenuArrowProps,
  DropdownMenuContentProps as SparDropdownMenuContentProps,
  DropdownMenuGroupProps as SparDropdownMenuGroupProps,
  DropdownMenuItemProps as SparDropdownMenuItemProps,
  DropdownMenuLabelProps as SparDropdownMenuLabelProps,
  DropdownMenuProps as SparDropdownMenuProps,
  DropdownMenuSeparatorProps as SparDropdownMenuSeparatorProps,
  DropdownMenuTriggerProps as SparDropdownMenuTriggerProps,
  DropdownMenuViewportProps as SparDropdownMenuViewportProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap, StateOnlyComponentThemeConfig } from '../../core';

export type DropdownSize = 'small' | 'base' | 'large';

/**
 * Controls the panel's render width.
 *
 * - `'content'`: panel shrink-wraps the longest item, only enforcing the CSS min-width
 * - `'trigger'`: panel matches the trigger's measured width
 * - `number`: explicit pixel width
 * - `string`: any CSS width value (`'20rem'`, `'min(40ch, 100%)'`, etc.)
 */
export type DropdownContentWidth = 'content' | 'trigger' | number | string;

export type DropdownTriggerSlot = 'root';
export type DropdownContentSlot = 'root';
export type DropdownViewportSlot = 'root';
export type DropdownItemSlot = 'root';
export type DropdownGroupSlot = 'root';
export type DropdownLabelSlot = 'root';
export type DropdownSeparatorSlot = 'root';
export type DropdownArrowSlot = 'root';

export interface DropdownOwnProps {
  /**
   * Size scale for the menu content and items.
   * @defaultValue 'base'
   */
  size?: DropdownSize;
  /**
   * How the portalled Dropdown.Content panel computes its width. See
   * {@link DropdownContentWidth}.
   * @defaultValue 'content'
   */
  contentWidth?: DropdownContentWidth;
}

/**
 * Public props for the Dropdown root. State-only — renders no DOM, so no
 * polymorphic `as` and no native HTML props.
 */
export type DropdownProps = DropdownOwnProps &
  // Spar DropdownMenu root owns controlled/uncontrolled open state, modal focus
  // behavior, disabled state, close-on-select, and child composition.
  Pick<SparDropdownMenuProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'modal' | 'disabled' | 'closeOnSelect' | 'children'>;

export interface DropdownTriggerOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownTriggerSlot>;
}

export type DropdownTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  DropdownTriggerOwnProps &
    // Trigger surface from Spar. `children` accepts ReactNode or render-prop
    // state for consumers that need open/close/toggle control.
    Pick<SparDropdownMenuTriggerProps, 'children'>
>;

export interface DropdownContentOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownContentSlot>;
}

export type DropdownContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownContentOwnProps &
    // Positioning, portal container, and dismiss/focus event hooks are exposed
    // for integration with surrounding overlays and focus orchestration.
    Pick<SparDropdownMenuContentProps, 'side' | 'align' | 'container' | 'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside'>
>;

export interface DropdownViewportOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownViewportSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownViewportSlot>;
}

export type DropdownViewportProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownViewportOwnProps &
    // Scrollable region from Spar: wraps the items and keeps the highlighted one
    // in view during keyboard navigation. It owns the panel's scroll bounds.
    Pick<SparDropdownMenuViewportProps, 'children'>
>;

export interface DropdownItemOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownItemSlot>;
}

export type DropdownItemProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownItemOwnProps &
    // Action item behavior from Spar: disabled state, selection callback, and
    // typeahead text when children are not plain text.
    Pick<SparDropdownMenuItemProps, 'disabled' | 'onSelect' | 'textValue'>
>;

export interface DropdownGroupOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownGroupSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownGroupSlot>;
}

export type DropdownGroupProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownGroupOwnProps &
    // Semantic grouping container from Spar: only child composition (a label
    // plus its items) is forwarded; the group owns no size, state, or events.
    Pick<SparDropdownMenuGroupProps, 'children'>
>;

export interface DropdownLabelOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownLabelSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownLabelSlot>;
}

export type DropdownLabelProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownLabelOwnProps &
    // Non-interactive group heading from Spar: only child composition (the label
    // text) is forwarded; it exposes no interactive or positioning props.
    Pick<SparDropdownMenuLabelProps, 'children'>
>;

export interface DropdownSeparatorOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownSeparatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownSeparatorSlot>;
}

export type DropdownSeparatorProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DropdownSeparatorOwnProps &
    // Visual separator from Spar: forwards only child composition — optional
    // content for a labeled divider, mirroring Select.Separator.
    Pick<SparDropdownMenuSeparatorProps, 'children'>
>;

export interface DropdownArrowOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<DropdownArrowSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<DropdownArrowSlot>;
}

export type DropdownArrowProps<T extends ElementType = 'svg'> = PolymorphicProps<
  'svg',
  T,
  DropdownArrowOwnProps &
    // Decorative pointer from Spar: forwards only `children`, which overrides the
    // default arrow glyph for a custom shape; no positioning or state props.
    Pick<SparDropdownMenuArrowProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Dropdown: StateOnlyComponentThemeConfig<DropdownProps>;
    DropdownTrigger: import('../../core').ComponentThemeConfig<DropdownTriggerProps, DropdownTriggerSlot>;
    DropdownContent: import('../../core').ComponentThemeConfig<DropdownContentProps, DropdownContentSlot>;
    DropdownViewport: import('../../core').ComponentThemeConfig<DropdownViewportProps, DropdownViewportSlot>;
    DropdownItem: import('../../core').ComponentThemeConfig<DropdownItemProps, DropdownItemSlot>;
    DropdownGroup: import('../../core').ComponentThemeConfig<DropdownGroupProps, DropdownGroupSlot>;
    DropdownLabel: import('../../core').ComponentThemeConfig<DropdownLabelProps, DropdownLabelSlot>;
    DropdownSeparator: import('../../core').ComponentThemeConfig<DropdownSeparatorProps, DropdownSeparatorSlot>;
    DropdownArrow: import('../../core').ComponentThemeConfig<DropdownArrowProps, DropdownArrowSlot>;
  }
}
