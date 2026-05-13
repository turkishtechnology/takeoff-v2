import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type {
  AccordionProps as SparAccordionProps,
  AccordionItemProps as SparAccordionItemProps,
  AccordionHeaderProps as SparAccordionHeaderProps,
  AccordionContentProps as SparAccordionContentProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Visual grouping vocabulary mirrored from Takeoff Core (`tk-accordion`).
 */
export type AccordionType = 'grouped' | 'divided';

/**
 * Density mode. `'compact'` reduces vertical rhythm; pairs with any
 * {@link AccordionType}. Default `'default'`.
 */
export type AccordionMode = 'default' | 'compact';

export type AccordionSize = 'base' | 'large';

export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AccordionValue = string | number;

/**
 * Current panel identifier(s). Scalar in single mode, array when
 * `multiple` is set.
 */
export type AccordionCurrentValue = AccordionValue | AccordionValue[];

export type AccordionValueChangeHandler = (next: AccordionCurrentValue) => void;

/**
 * Position of the auto-rendered arrow inside the trigger.
 * @defaultValue 'right'
 */
export type AccordionArrowPosition = 'left' | 'right';

export type AccordionSlot = 'root';
export type AccordionItemSlot = 'root';
export type AccordionHeaderSlot = 'root';
export type AccordionTriggerSlot = 'root' | 'icon' | 'arrow';
export type AccordionTriggerTitleSlot = 'root';
export type AccordionContentSlot = 'root';

/**
 * Public props for the Accordion root. Behavior props are forwarded to the
 * Spar primitive unchanged. Visual props (`type`, `mode`, `size`,
 * `arrowPosition`, `hideArrows`, `expandIcon`, `collapseIcon`) are
 * takeoff-spar's own and cascade to descendants through the visual context.
 */
export interface AccordionProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames' | 'defaultValue' | 'onChange'>,
    Pick<SparAccordionProps, 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'collapsible' | 'disabled' | 'orientation'> {
  /**
   * Visual grouping.
   * @defaultValue 'grouped'
   */
  type?: AccordionType;
  /**
   * Density mode. Pairs with any {@link AccordionType}.
   * @defaultValue 'default'
   */
  mode?: AccordionMode;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: AccordionSize;
  /**
   * Position of the auto-rendered arrow inside each trigger.
   * @defaultValue 'right'
   */
  arrowPosition?: AccordionArrowPosition;
  /**
   * Hide the auto-rendered arrow on every trigger.
   * @defaultValue false
   */
  hideArrows?: boolean;
  /**
   * Visual content for the arrow when an item is collapsed.
   * @defaultValue a built-in chevron pointing down
   */
  expandIcon?: ReactNode;
  /**
   * Visual content for the arrow when an item is expanded.
   * @defaultValue a built-in chevron pointing up
   */
  collapseIcon?: ReactNode;

  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionSlot>;

  ref?: Ref<HTMLDivElement>;
}

export interface AccordionItemProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'>,
    Pick<SparAccordionItemProps, 'value' | 'disabled'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionItemSlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface AccordionHeaderProps
  extends Omit<ComponentPropsWithoutRef<'h3'>, 'classNames'>,
    Pick<SparAccordionHeaderProps, 'level'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionHeaderSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionHeaderSlot>;
  ref?: Ref<HTMLHeadingElement>;
}

export interface AccordionTriggerProps extends Omit<ComponentPropsWithoutRef<'button'>, 'classNames'> {
  /**
   * Leading icon rendered before the title. The wrapper node (class +
   * `data-slot`) is invariant — only the icon node itself is consumer-supplied.
   */
  icon?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionTriggerSlot>;
  ref?: Ref<HTMLButtonElement>;
}

export interface AccordionTriggerTitleProps extends Omit<ComponentPropsWithoutRef<'span'>, 'classNames'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionTriggerTitleSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionTriggerTitleSlot>;
  ref?: Ref<HTMLSpanElement>;
}

export interface AccordionContentProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'>,
    Pick<SparAccordionContentProps, 'forceMount' | 'onBeforeMatch'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionContentSlot>;
  ref?: Ref<HTMLDivElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Accordion: import('../../core').ComponentThemeConfig<AccordionProps>;
    AccordionItem: import('../../core').ComponentThemeConfig<AccordionItemProps>;
    AccordionHeader: import('../../core').ComponentThemeConfig<AccordionHeaderProps>;
    AccordionTrigger: import('../../core').ComponentThemeConfig<AccordionTriggerProps, AccordionTriggerSlot>;
    AccordionTriggerTitle: import('../../core').ComponentThemeConfig<AccordionTriggerTitleProps>;
    AccordionContent: import('../../core').ComponentThemeConfig<AccordionContentProps>;
  }
}
