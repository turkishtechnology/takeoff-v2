import type { ElementType } from 'react';
import type { TooltipProps as SparTooltipProps, TooltipContentProps as SparTooltipContentProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type TooltipVariant = 'dark' | 'white' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type TooltipTriggerSlot = 'root';

export type TooltipContentSlot = 'root';

export type TooltipHeaderSlot = 'root';

export type TooltipDescriptionSlot = 'root';

export type TooltipArrowSlot = 'root';

/**
 * Public props for the Tooltip root. State-only — renders no DOM, so no
 * polymorphic `as` and no native HTML props.
 */
// Spar Tooltip root: identity, controlled state, timing, disable, and the
// trigger+content children. Tooltip root is state-only and renders no DOM,
// so no native HTML props beyond `children` are exposed.
export type TooltipProps = Pick<SparTooltipProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'delay' | 'hideDelay' | 'disabled' | 'children'>;

export interface TooltipTriggerOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipTriggerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipTriggerSlot>;
}

export type TooltipTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, TooltipTriggerOwnProps>;

export interface TooltipContentOwnProps {
  /**
   * Color variant.
   * @defaultValue 'dark'
   */
  variant?: TooltipVariant;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipContentSlot>;
}

export type TooltipContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  TooltipContentOwnProps &
    // Positioning (side/align), portal container, and dismiss/focus event hooks.
    // `variant` is takeoff-v2's own visual token — in TooltipContentOwnProps
    // above, not picked.
    Pick<SparTooltipContentProps, 'side' | 'align' | 'container' | 'onEscapeKeyDown' | 'onPointerDownOutside' | 'onOpenAutoFocus' | 'onCloseAutoFocus'>
>;

export interface TooltipHeaderOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipHeaderSlot>;
}

export type TooltipHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TooltipHeaderOwnProps>;

export interface TooltipDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipDescriptionSlot>;
}

export type TooltipDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, TooltipDescriptionOwnProps>;

export interface TooltipArrowOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipArrowSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipArrowSlot>;
}

export type TooltipArrowProps<T extends ElementType = 'svg'> = PolymorphicProps<'svg', T, TooltipArrowOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    TooltipTrigger: import('../../core').ComponentThemeConfig<TooltipTriggerProps, TooltipTriggerSlot>;
    TooltipContent: import('../../core').ComponentThemeConfig<TooltipContentProps, TooltipContentSlot>;
    TooltipHeader: import('../../core').ComponentThemeConfig<TooltipHeaderProps, TooltipHeaderSlot>;
    TooltipDescription: import('../../core').ComponentThemeConfig<TooltipDescriptionProps, TooltipDescriptionSlot>;
    TooltipArrow: import('../../core').ComponentThemeConfig<TooltipArrowProps, TooltipArrowSlot>;
  }
}
