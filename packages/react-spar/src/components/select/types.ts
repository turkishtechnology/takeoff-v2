import type { ElementType } from 'react';
import type {
  SelectProps as SparSelectProps,
  SelectTriggerProps as SparSelectTriggerProps,
  SelectValueProps as SparSelectValueProps,
  SelectContentProps as SparSelectContentProps,
  SelectItemProps as SparSelectItemProps,
  SelectGroupProps as SparSelectGroupProps,
  SelectLabelProps as SparSelectLabelProps,
  SelectItemTextProps as SparSelectItemTextProps,
  SelectSeparatorProps as SparSelectSeparatorProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type SelectSize = 'small' | 'base' | 'large';

export type SelectSlot = 'root';
export type SelectTriggerSlot = 'root';
export type SelectValueSlot = 'root';
export type SelectContentSlot = 'root';
export type SelectItemSlot = 'root';
export type SelectGroupSlot = 'root';
export type SelectLabelSlot = 'root';
export type SelectItemTextSlot = 'root';
export type SelectSeparatorSlot = 'root';

/**
 * Visual + slot props owned by takeoff-v2 for the Select root. `size` and
 * `isInvalid` cascade to the Trigger through a visual context so consumers
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
  isInvalid?: boolean;
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
    // autoFocus). Visual concerns (size, isInvalid) are takeoff-v2's own and
    // are declared in SelectOwnProps above.
    Pick<SparSelectProps, 'id' | 'value' | 'defaultValue' | 'onValueChange' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'required' | 'name' | 'autoFocus'>
>;

export interface SelectTriggerOwnProps {
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
    // isOpen/value/disabled/open/close/toggle state without a separate hook.
    Pick<SparSelectTriggerProps, 'children'>
>;

export interface SelectValueOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectValueSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectValueSlot>;
}

export type SelectValueProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  SelectValueOwnProps &
    // Placeholder shown when no value is selected; rendered by Spar.
    Pick<SparSelectValueProps, 'placeholder'>
>;

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
    // Item identity (`value`), per-item disable, typeahead override (`textValue`),
    // and the render-prop children form for accessing selected/highlighted state.
    Pick<SparSelectItemProps, 'value' | 'disabled' | 'textValue' | 'children'>
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

export interface SelectItemTextOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SelectItemTextSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SelectItemTextSlot>;
}

export type SelectItemTextProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  SelectItemTextOwnProps &
    // Inherit text surface; textValue registration is wired by Spar via context.
    Pick<SparSelectItemTextProps, 'children'>
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
    SelectValue: import('../../core').ComponentThemeConfig<SelectValueProps, SelectValueSlot>;
    SelectContent: import('../../core').ComponentThemeConfig<SelectContentProps, SelectContentSlot>;
    SelectItem: import('../../core').ComponentThemeConfig<SelectItemProps, SelectItemSlot>;
    SelectGroup: import('../../core').ComponentThemeConfig<SelectGroupProps, SelectGroupSlot>;
    SelectLabel: import('../../core').ComponentThemeConfig<SelectLabelProps, SelectLabelSlot>;
    SelectItemText: import('../../core').ComponentThemeConfig<SelectItemTextProps, SelectItemTextSlot>;
    SelectSeparator: import('../../core').ComponentThemeConfig<SelectSeparatorProps, SelectSeparatorSlot>;
  }
}
