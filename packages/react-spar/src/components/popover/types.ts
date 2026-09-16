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
 * Public props for the Popover root. Spar renders a plain, unstyled
 * `<div data-state="open" | "closed">` around the children; the wrapper adds
 * no slot to it, so there is no polymorphic `as`, no `className` /
 * `classNames` / `slotProps`, and no native HTML props here. Style the parts
 * instead.
 */
export interface PopoverProps
  // Spar Popover root: controlled state and children. `id`, `modal` and
  // `disabled` are redeclared below (same Spar types) because Spar's own JSDoc
  // for them does not match what it renders.
  extends Pick<SparPopoverProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'children'> {
  /**
   * Base id for ARIA wiring. When omitted one is generated. Only the content
   * derives an id from it (`${id}-content`); the trigger receives no `id` and
   * points at the content through `aria-controls`.
   */
  id?: string;
  /**
   * Modal mode: the open content gets `role="dialog"` + `aria-modal="true"`
   * and focus is trapped inside it (same as `trapFocus` on `Popover.Content`).
   * No backdrop is rendered. A pointer down outside still dismisses the
   * popover; because focus cannot leave, focus-outside dismissal does not
   * apply.
   * @defaultValue false
   */
  modal?: boolean;
  /**
   * Disables every `Popover.Trigger` (native `disabled`, click ignored) so the
   * user cannot open the popover. It does not lock the state: `defaultOpen` /
   * `open` still show the content, and the render-prop `open()` / `toggle()`
   * still open it and call `onOpenChange(true)`.
   * @defaultValue false
   */
  disabled?: boolean;
}

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
  /**
   * Called when the popover opens, right before focus moves inside (to the
   * first focusable element, else the content itself). Receives a cancelable
   * `openautofocus` event; call `preventDefault()` to skip the auto-focus and
   * leave focus where it is.
   */
  onOpenAutoFocus?: (event: Event) => void;
  /**
   * Called when focus moves outside the content and trigger (non-modal,
   * non-trapped popovers only). Receives a cancelable `focusoutside`
   * `FocusEvent` dispatched on the newly focused element (native `focusin`
   * is not cancelable); `event.target` is the element that received focus.
   * Call `preventDefault()` to keep the popover open.
   */
  onFocusOutside?: (event: FocusEvent) => void;
  /**
   * Called for any outside interaction, after `onPointerDownOutside` or
   * `onFocusOutside`, with the `pointerdown` event or the cancelable
   * `focusoutside` `FocusEvent` described on `onFocusOutside`. Call
   * `preventDefault()` on either to keep the popover open.
   */
  onInteractOutside?: (event: PointerEvent | FocusEvent) => void;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<PopoverContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<PopoverContentSlot>;
}

export type PopoverContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  PopoverContentOwnProps &
    // Positioning (side/align), portal container, focus trap, and the
    // remaining dismiss / focus hooks. `onOpenAutoFocus`, `onFocusOutside`
    // and `onInteractOutside` are redeclared in PopoverContentOwnProps (same
    // Spar signatures) so the wrapper docs spell out the cancelable event
    // shapes and vetoes in one place.
    Pick<SparPopoverContentProps, 'side' | 'align' | 'container' | 'trapFocus' | 'onCloseAutoFocus' | 'onEscapeKeyDown' | 'onPointerDownOutside'>
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
