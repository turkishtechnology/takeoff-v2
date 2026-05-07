import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Visual grouping vocabulary mirrored from Takeoff Core (`tk-accordion`).
 *
 * `'compact'` is supported during the current major as a deprecated alias for
 * `mode='compact'` and triggers a one-time dev warning when used. It will be
 * removed in the next major release.
 */
export type AccordionType = 'grouped' | 'divided' | 'compact';

/**
 * Density mode. `'compact'` reduces vertical rhythm; pairs with any
 * {@link AccordionType}. Default `'default'`.
 */
export type AccordionMode = 'default' | 'compact';

export type AccordionSize = 'base' | 'large';

export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Identity of a single Accordion item. Mirrors Takeoff Core's
 * `tk-accordion-item.itemKey` and is forwarded to the Spar primitive
 * unchanged.
 */
export type AccordionItemKey = string | number;

/**
 * Currently active panel identifier(s). Scalar in single mode, array when
 * `allowMultiple` is set.
 */
export type AccordionActiveIndex = AccordionItemKey | AccordionItemKey[];

export type AccordionActiveIndexChangeHandler = (next: AccordionActiveIndex) => void;

/**
 * Position of the auto-rendered arrow inside the trigger.
 * @defaultValue 'right'
 */
export type AccordionArrowPosition = 'left' | 'right';

export type AccordionSlot = 'root';
export type AccordionItemSlot = 'root';
export type AccordionHeaderSlot = 'root';
export type AccordionTriggerSlot = 'root';
export type AccordionContentSlot = 'root';

/**
 * Public props for the Accordion root. Behavior props (`allowMultiple`,
 * `activeIndex`, `defaultActiveIndex`, `onActiveIndexChange`,
 * `preventCollapse`, `disabled`, `orientation`) are forwarded to the Spar
 * primitive unchanged. Visual props (`type`, `mode`, `size`, `arrowPosition`,
 * `hideArrows`, `expandIcon`, `collapseIcon`) are takeoff-spar's own and
 * cascade to descendants through the visual context.
 */
export interface AccordionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames' | 'defaultValue' | 'onChange'> {
  /**
   * Visual grouping. `'compact'` is a deprecated alias for
   * `(type='grouped', mode='compact')` and emits a dev warning.
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

  /** When `true`, multiple items can be expanded simultaneously. */
  allowMultiple?: boolean;
  /** Controlled active item identifier(s). */
  activeIndex?: AccordionActiveIndex;
  /** Uncontrolled initial active item identifier(s). */
  defaultActiveIndex?: AccordionActiveIndex;
  /** Fired when the active set changes. */
  onActiveIndexChange?: AccordionActiveIndexChangeHandler;
  /** When `true`, single-mode items cannot be collapsed by clicking again. */
  preventCollapse?: boolean;
  /** Disables every item in the accordion. */
  disabled?: boolean;
  /** Orientation for keyboard navigation. */
  orientation?: 'vertical' | 'horizontal';

  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionSlot>;

  ref?: Ref<HTMLDivElement>;
}

export interface AccordionItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /**
   * Stable identity for this item. Required so root controlled props
   * (`activeIndex`, `defaultActiveIndex`) can target this item reliably.
   * Forwarded to the Spar primitive verbatim.
   */
  itemKey: AccordionItemKey;
  /** Disables this item only. */
  disabled?: boolean;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionItemSlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface AccordionHeaderProps extends Omit<ComponentPropsWithoutRef<'h3'>, 'classNames'> {
  /** HTML heading level (1-6). */
  level?: AccordionHeadingLevel;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionHeaderSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionHeaderSlot>;
  ref?: Ref<HTMLHeadingElement>;
}

export interface AccordionTriggerProps extends Omit<ComponentPropsWithoutRef<'button'>, 'classNames'> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionTriggerSlot>;
  ref?: Ref<HTMLButtonElement>;
}

export interface AccordionContentProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** Render content even while collapsed. */
  forceMount?: boolean;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionContentSlot>;
  ref?: Ref<HTMLDivElement>;
}
