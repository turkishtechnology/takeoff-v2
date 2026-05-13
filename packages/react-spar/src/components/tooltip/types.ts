import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type {
  TooltipProps as SparTooltipProps,
  TooltipContentProps as SparTooltipContentProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type TooltipVariant = 'dark' | 'white' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type TooltipTriggerSlot = 'root';

export type TooltipContentSlot = 'root';

export type TooltipHeaderSlot = 'root';

export type TooltipDescriptionSlot = 'root';

export type TooltipArrowSlot = 'root';

export interface TooltipProps
  extends Pick<SparTooltipProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'delay' | 'hideDelay' | 'disabled'> {
  /**
   * Tooltip trigger and content components.
   */
  children?: ReactNode;
}

export interface TooltipTriggerProps extends Omit<ComponentPropsWithoutRef<'button'>, 'classNames' | 'slotProps'> {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipTriggerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipTriggerSlot>;
  /** Ref forwarded to the trigger element. */
  ref?: Ref<HTMLButtonElement>;
}

export interface TooltipContentProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames' | 'slotProps'>,
    Pick<SparTooltipContentProps, 'side' | 'align' | 'container' | 'onEscapeKeyDown' | 'onPointerDownOutside' | 'onOpenAutoFocus' | 'onCloseAutoFocus'> {
  /**
   * Color variant.
   * @defaultValue 'dark'
   */
  variant?: TooltipVariant;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipContentSlot>;
  /** Ref forwarded to the content element. */
  ref?: Ref<HTMLDivElement>;
}

export interface TooltipHeaderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames' | 'slotProps'> {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipHeaderSlot>;
  /** Ref forwarded to the header element. */
  ref?: Ref<HTMLDivElement>;
}

export interface TooltipDescriptionProps extends Omit<ComponentPropsWithoutRef<'p'>, 'classNames' | 'slotProps'> {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipDescriptionSlot>;
  /** Ref forwarded to the description element. */
  ref?: Ref<HTMLParagraphElement>;
}

export interface TooltipArrowProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'classNames' | 'slotProps'> {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipArrowSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipArrowSlot>;
  /** Ref forwarded to the arrow SVG element. */
  ref?: Ref<SVGSVGElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    TooltipTrigger: import('../../core').ComponentThemeConfig<TooltipTriggerProps, TooltipTriggerSlot>;
    TooltipContent: import('../../core').ComponentThemeConfig<TooltipContentProps, TooltipContentSlot>;
    TooltipHeader: import('../../core').ComponentThemeConfig<TooltipHeaderProps, TooltipHeaderSlot>;
    TooltipDescription: import('../../core').ComponentThemeConfig<TooltipDescriptionProps, TooltipDescriptionSlot>;
    TooltipArrow: import('../../core').ComponentThemeConfig<TooltipArrowProps, TooltipArrowSlot>;
  }
}
