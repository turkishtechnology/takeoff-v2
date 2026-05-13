import type { ElementType, ReactNode } from 'react';
import type {
  AccordionProps as SparAccordionProps,
  AccordionItemProps as SparAccordionItemProps,
  AccordionHeaderProps as SparAccordionHeaderProps,
  AccordionContentProps as SparAccordionContentProps,
  PolymorphicProps,
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
 * Visual + slot props owned by takeoff-v2 for the Accordion root. Cascades to
 * descendants through the visual context (`type`, `mode`, `size`, arrows).
 */
export interface AccordionOwnProps {
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
}

/**
 * Public props for the Accordion root. Polymorphic via `as`; ref and the
 * native attributes of the rendered element are inherited from Spar's
 * `PolymorphicProps`.
 */
export type AccordionProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  AccordionOwnProps &
    // Spar Accordion root state & a11y surface. Visual concerns (type, mode,
    // size, arrows, icons) are takeoff-spar's own — in AccordionOwnProps
    // above, not picked.
    Pick<SparAccordionProps, 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'collapsible' | 'disabled' | 'orientation'>
>;

export interface AccordionItemOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionItemSlot>;
}

export type AccordionItemProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  AccordionItemOwnProps &
    // Item identity (`value`) and per-item disable — required for the root's
    // controlled props to target this item.
    Pick<SparAccordionItemProps, 'value' | 'disabled'>
>;

export interface AccordionHeaderOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionHeaderSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionHeaderSlot>;
}

export type AccordionHeaderProps<T extends ElementType = 'h3'> = PolymorphicProps<
  'h3',
  T,
  AccordionHeaderOwnProps &
    // Semantic heading level for a11y; rendered tag follows.
    Pick<SparAccordionHeaderProps, 'level'>
>;

export interface AccordionTriggerOwnProps {
  /**
   * Leading icon rendered before the title. The wrapper node (class +
   * `data-slot`) is invariant — only the icon node itself is consumer-supplied.
   */
  icon?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionTriggerSlot>;
}

export type AccordionTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  AccordionTriggerOwnProps
>;

export interface AccordionTriggerTitleOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionTriggerTitleSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionTriggerTitleSlot>;
}

export type AccordionTriggerTitleProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  AccordionTriggerTitleOwnProps
>;

export interface AccordionContentOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionContentSlot>;
}

export type AccordionContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  AccordionContentOwnProps &
    // Content mount control: `forceMount` for SEO/measure cases, `onBeforeMatch`
    // for find-in-page integration. Other Spar content props are not exposed.
    Pick<SparAccordionContentProps, 'forceMount' | 'onBeforeMatch'>
>;

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
