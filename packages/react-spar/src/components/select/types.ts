import type { ElementType, ReactNode } from 'react';
import type {
  SelectProps as SparSelectProps,
  SelectTriggerProps as SparSelectTriggerProps,
  SelectContentProps as SparSelectContentProps,
  SelectItemProps as SparSelectItemProps,
  SelectGroupProps as SparSelectGroupProps,
  SelectLabelProps as SparSelectLabelProps,
  SelectSeparatorProps as SparSelectSeparatorProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type SelectSize = 'small' | 'base' | 'large';

/**
 * Controls the panel's render width.
 *
 * - `'trigger'`: panel matches the trigger's measured width (form-aligned default)
 * - `'content'`: panel shrink-wraps the longest item, only enforcing the CSS min-width
 * - `number`: explicit pixel width
 * - `string`: any CSS width value (`'20rem'`, `'min(40ch, 100%)'`, etc.)
 */
export type SelectContentWidth = 'trigger' | 'content' | number | string;

export type SelectSlot = 'root';
export type SelectTriggerSlot = 'root' | 'value' | 'indicator';
export type SelectIndicatorSlot = 'root';
export type SelectContentSlot = 'root';
export type SelectItemSlot = 'root';
export type SelectGroupSlot = 'root';
export type SelectLabelSlot = 'root';
export type SelectSeparatorSlot = 'root';

/**
 * Visual + slot props owned by takeoff-v2 for the Select root. `size` and
 * `invalid` cascade to the Trigger through a visual context so consumers
 * declare them once on the root.
 */
export interface SelectOwnProps {
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: SelectSize;
  /**
   * Invalid state for form validation styling.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * How the portalled SelectContent panel computes its width. See
   * {@link SelectContentWidth}.
   * @defaultValue 'trigger'
   */
  contentWidth?: SelectContentWidth;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectSlot>;
}

/**
 * Public props for the Select root. Polymorphic via `as`; ref and the native
 * attributes of the rendered element are inherited from Spar's
 * `PolymorphicProps`.
 */
export type SelectProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  SelectOwnProps &
    // Spar Select root: identity, controlled/uncontrolled value & open state,
    // form integration (name, required), and behavior knobs (disabled,
    // autoFocus). Visual concerns (size, invalid) are takeoff-v2's own and
    // are declared in SelectOwnProps above.
    Pick<SparSelectProps, 'id' | 'value' | 'defaultValue' | 'onChange' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'readOnly' | 'required' | 'name' | 'autoFocus'>
>;

/**
 * State surface delivered to a render-function `indicator` (on the Trigger) or
 * to {@link SelectIndicatorProps.children}. Lets consumers swap icons by open
 * state without pulling the select context themselves. Mirrors the Accordion
 * indicator's render state.
 */
export interface SelectIndicatorRenderState {
  isOpen: boolean;
}

export interface SelectTriggerOwnProps {
  /**
   * Disclosure indicator rendered at the trailing edge of the trigger,
   * after the value/placeholder. Defaults to a chevron that flips direction
   * with the open state (parity with `Accordion.Indicator`).
   *
   * - omit / `true` → the default chevron
   * - `false` / `null` → no indicator
   * - a ReactNode → custom static icon (rendered in every state)
   * - a render function receiving `{ isOpen }` → swap icons by open state
   *
   * Ignored when `children` is a render function: a render-prop `children` opts
   * the trigger out of the built-in indicator and value wrapper entirely, so
   * you can drop a standalone `<Select.Indicator />` into your own layout
   * without a doubled chevron.
   * @defaultValue true
   */
  indicator?: boolean | ReactNode | ((state: SelectIndicatorRenderState) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectTriggerSlot>;
}

export type SelectTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  SelectTriggerOwnProps &
    // Trigger surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing
    // isOpen/value/label/disabled/open/close/toggle state without a separate hook.
    // `placeholder` is the empty-state text rendered when no value is selected;
    // since Spar 0.2.0-beta.1 the trigger renders this directly (Select.Value
    // no longer exists), so the wrapper must forward it.
    Pick<SparSelectTriggerProps, 'children' | 'placeholder'>
>;

export interface SelectIndicatorOwnProps {
  /**
   * Override the default chevron. Accepts a ReactNode (rendered in every
   * state) or a render function receiving the live `{ isOpen }` state — use
   * the render-prop form to swap icons by open state without consuming the
   * select context manually. Mirrors `Accordion.Indicator`.
   */
  children?: ReactNode | ((state: SelectIndicatorRenderState) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectIndicatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectIndicatorSlot>;
}

export type SelectIndicatorProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, SelectIndicatorOwnProps>;

export interface SelectContentOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectContentSlot>;
}

export type SelectContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  SelectContentOwnProps &
    // Positioning (side/align), portal container, and dismiss/focus event hooks.
    // Consumers need these to integrate with their own focus orchestration and
    // veto dismissal.
    Pick<SparSelectContentProps, 'side' | 'align' | 'container' | 'onEscapeKeyDown' | 'onPointerDownOutside' | 'onCloseAutoFocus'>
>;

export interface SelectItemOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectItemSlot>;
}

export type SelectItemProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  SelectItemOwnProps &
    // Item identity (`value`), per-item disable, and the render-prop children
    // form for accessing selected/highlighted state. `label` is the item's text
    // representation — shown in the trigger when this item is selected and
    // used as the typeahead search key. (Renamed from `textValue` in Spar
    // 0.2.0-beta.1 to align with native HTML <option label>.)
    Pick<SparSelectItemProps, 'value' | 'disabled' | 'label' | 'children'>
>;

export interface SelectGroupOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectGroupSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectGroupSlot>;
}

export type SelectGroupProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  SelectGroupOwnProps &
    // Inherit group surface; aria-labelledby is wired by Spar via context.
    Pick<SparSelectGroupProps, 'children'>
>;

export interface SelectLabelOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectLabelSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectLabelSlot>;
}

export type SelectLabelProps<T extends ElementType = 'label'> = PolymorphicProps<
  'label',
  T,
  SelectLabelOwnProps &
    // Inherit label surface; group association is wired by Spar via context.
    Pick<SparSelectLabelProps, 'children'>
>;

export interface SelectSeparatorOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectSeparatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectSeparatorSlot>;
}

export type SelectSeparatorProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  SelectSeparatorOwnProps &
    // Inherit separator surface; role/aria are wired by Spar.
    Pick<SparSelectSeparatorProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Select: import('../../core').ComponentThemeConfig<SelectProps, SelectSlot>;
    SelectTrigger: import('../../core').ComponentThemeConfig<SelectTriggerProps, SelectTriggerSlot>;
    SelectIndicator: import('../../core').ComponentThemeConfig<SelectIndicatorProps, SelectIndicatorSlot>;
    SelectContent: import('../../core').ComponentThemeConfig<SelectContentProps, SelectContentSlot>;
    SelectItem: import('../../core').ComponentThemeConfig<SelectItemProps, SelectItemSlot>;
    SelectGroup: import('../../core').ComponentThemeConfig<SelectGroupProps, SelectGroupSlot>;
    SelectLabel: import('../../core').ComponentThemeConfig<SelectLabelProps, SelectLabelSlot>;
    SelectSeparator: import('../../core').ComponentThemeConfig<SelectSeparatorProps, SelectSeparatorSlot>;
  }
}
