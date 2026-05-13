import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type TooltipVariant = 'dark' | 'white' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export type TooltipAlign = 'start' | 'center' | 'end';

export type TooltipTriggerSlot = 'root';

export type TooltipContentSlot = 'root';

export type TooltipHeaderSlot = 'root';

export type TooltipDescriptionSlot = 'root';

export type TooltipArrowSlot = 'root';

export interface TooltipProps {
  /**
   * Tooltip trigger and content components.
   */
  children?: ReactNode;
  /**
   * Controlled state for tooltip visibility.
   */
  open?: boolean;
  /**
   * Default open state for uncontrolled tooltip.
   * @defaultValue false
   */
  defaultOpen?: boolean;
  /**
   * Callback when tooltip open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Delay in ms before the tooltip appears.
   */
  delay?: number;
  /**
   * Delay in ms before the tooltip hides.
   * @defaultValue 0
   */
  hideDelay?: number;
  /**
   * Whether the tooltip is disabled.
   * @defaultValue false
   */
  disabled?: boolean;
}

export interface TooltipTriggerOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipTriggerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipTriggerSlot>;
  /** Ref forwarded to the trigger element. */
  ref?: Ref<HTMLButtonElement>;
}

export type TooltipTriggerProps = TooltipTriggerOwnProps & Omit<ComponentPropsWithoutRef<'button'>, keyof TooltipTriggerOwnProps>;

export interface TooltipContentOwnProps {
  /**
   * Color variant.
   * @defaultValue 'dark'
   */
  variant?: TooltipVariant;
  /**
   * Preferred side relative to the trigger.
   * @defaultValue 'top'
   */
  side?: TooltipSide;
  /**
   * Alignment relative to the trigger.
   * @defaultValue 'center'
   */
  align?: TooltipAlign;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipContentSlot>;
  /** Ref forwarded to the content element. */
  ref?: Ref<HTMLDivElement>;
}

export type TooltipContentProps = TooltipContentOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof TooltipContentOwnProps>;

export interface TooltipHeaderOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipHeaderSlot>;
  /** Ref forwarded to the header element. */
  ref?: Ref<HTMLDivElement>;
}

export type TooltipHeaderProps = TooltipHeaderOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof TooltipHeaderOwnProps>;

export interface TooltipDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipDescriptionSlot>;
  /** Ref forwarded to the description element. */
  ref?: Ref<HTMLParagraphElement>;
}

export type TooltipDescriptionProps = TooltipDescriptionOwnProps & Omit<ComponentPropsWithoutRef<'p'>, keyof TooltipDescriptionOwnProps>;

export interface TooltipArrowOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TooltipArrowSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TooltipArrowSlot>;
  /** Ref forwarded to the arrow SVG element. */
  ref?: Ref<SVGSVGElement>;
}

export type TooltipArrowProps = TooltipArrowOwnProps & Omit<ComponentPropsWithoutRef<'svg'>, keyof TooltipArrowOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    TooltipTrigger: import('../../core').ComponentThemeConfig<TooltipTriggerProps, TooltipTriggerSlot>;
    TooltipContent: import('../../core').ComponentThemeConfig<TooltipContentProps, TooltipContentSlot>;
    TooltipHeader: import('../../core').ComponentThemeConfig<TooltipHeaderProps, TooltipHeaderSlot>;
    TooltipDescription: import('../../core').ComponentThemeConfig<TooltipDescriptionProps, TooltipDescriptionSlot>;
    TooltipArrow: import('../../core').ComponentThemeConfig<TooltipArrowProps, TooltipArrowSlot>;
  }
}
