import type { ElementType } from 'react';
import type {
  PopoverProps as SparPopoverProps,
  PopoverContentProps as SparPopoverContentProps,
  PopoverTriggerProps as SparPopoverTriggerProps,
  PopoverCloseProps as SparPopoverCloseProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap, StateOnlyComponentThemeConfig } from '../../core';

/**
 * Visual variant of the popover content.
 * @defaultValue 'white'
 */
export type PopoverVariant = 'white' | 'dark' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type PopoverTriggerSlot = 'root';

export type PopoverContentSlot = 'root';

export type PopoverHeaderSlot = 'root';

export type PopoverDescriptionSlot = 'root';

export type PopoverArrowSlot = 'root';

export type PopoverCloseSlot = 'root';

/**
 * Public props for the Popover root. State-only — renders no DOM, so no
 * polymorphic `as` and no native HTML props.
 */
// Spar Popover root: identity, controlled state, modal mode, disable, and
// children. Popover root is state-only and renders no DOM, so no native HTML
// props beyond `children` are exposed.
export type PopoverProps = Pick<SparPopoverProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'modal' | 'disabled' | 'children'>;

export interface PopoverTriggerOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverTriggerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverTriggerSlot>;
}

export type PopoverTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  PopoverTriggerOwnProps &
    // Trigger surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing
    // open/close/toggle state without a separate hook.
    Pick<SparPopoverTriggerProps, 'children'>
>;

export interface PopoverContentOwnProps {
  /**
   * Color variant.
   * @defaultValue 'white'
   */
  variant?: PopoverVariant;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverContentSlot>;
}

export type PopoverContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  PopoverContentOwnProps &
    // Positioning (side/align), portal container, focus management, and dismiss
    // event hooks. These are the consumer-facing knobs for integration with
    // their own focus and dismiss orchestration.
    Pick<
      SparPopoverContentProps,
      'side' | 'align' | 'container' | 'trapFocus' | 'onOpenAutoFocus' | 'onCloseAutoFocus' | 'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside' | 'onInteractOutside'
    >
>;

export interface PopoverHeaderOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverHeaderSlot>;
}

export type PopoverHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PopoverHeaderOwnProps>;

export interface PopoverDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverDescriptionSlot>;
}

export type PopoverDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, PopoverDescriptionOwnProps>;

export interface PopoverArrowOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverArrowSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverArrowSlot>;
}

export type PopoverArrowProps<T extends ElementType = 'svg'> = PolymorphicProps<'svg', T, PopoverArrowOwnProps>;

export interface PopoverCloseOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverCloseSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverCloseSlot>;
}

export type PopoverCloseProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  PopoverCloseOwnProps &
    // Close surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing close state.
    Pick<SparPopoverCloseProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Popover: StateOnlyComponentThemeConfig<PopoverProps>;
    PopoverTrigger: import('../../core').ComponentThemeConfig<PopoverTriggerProps, PopoverTriggerSlot>;
    PopoverContent: import('../../core').ComponentThemeConfig<PopoverContentProps, PopoverContentSlot>;
    PopoverHeader: import('../../core').ComponentThemeConfig<PopoverHeaderProps, PopoverHeaderSlot>;
    PopoverDescription: import('../../core').ComponentThemeConfig<PopoverDescriptionProps, PopoverDescriptionSlot>;
    PopoverArrow: import('../../core').ComponentThemeConfig<PopoverArrowProps, PopoverArrowSlot>;
    PopoverClose: import('../../core').ComponentThemeConfig<PopoverCloseProps, PopoverCloseSlot>;
  }
}
