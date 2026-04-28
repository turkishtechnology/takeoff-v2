import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import type {
  AccordionContentProps as SparAccordionContentProps,
  AccordionHeaderProps as SparAccordionHeaderProps,
  AccordionItemProps as SparAccordionItemProps,
  AccordionProps as SparAccordionProps,
  AccordionTriggerProps as SparAccordionTriggerProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../types';

/**
 * Visual grouping vocabulary mirrored from Takeoff Core (`tk-accordion`).
 *
 * `'compact'` is supported during the current major as a deprecated alias for
 * `mode='compact'` and triggers a one-time dev warning when used. It will be
 * removed in the next major release per `docs/component-api-audit.md` row 18.
 */
export type AccordionType = 'grouped' | 'divided' | 'compact';

/**
 * Density mode. `'compact'` reduces vertical rhythm; pairs with any
 * {@link AccordionType}. Default `'default'`.
 */
export type AccordionMode = 'default' | 'compact';

export type AccordionSize = 'base' | 'large';

/**
 * Identity of a single Accordion item. Matches Takeoff Core's `itemKey` shape
 * on `tk-accordion-item`. The wrapper stringifies the value when handing it
 * to the Spar primitive but preserves the original shape on the
 * `onActiveIndexChange` payload.
 */
export type AccordionItemKey = string | number;

/**
 * Currently active panel identifiers. Mirrors Core
 * `tk-accordion.activeIndex`: a single value (`single` selection) or an array
 * (`allowMultiple`).
 */
export type AccordionActiveIndex = AccordionItemKey | AccordionItemKey[];

export type AccordionSlot = 'root';
export type AccordionItemSlot = 'root';
export type AccordionHeaderSlot = 'root';
export type AccordionTriggerSlot = 'root';
export type AccordionContentSlot = 'root';
export type AccordionArrowSlot = 'root';

/**
 * Spar primitive props the wrapper hides from its public API. The adapter hook
 * (`useAccordionAdapter`) is the only consumer of these names; surfacing them
 * through `AccordionProps` would re-introduce the leak the Takeoff vocabulary
 * is meant to prevent (see `docs/contract-model.md` § "State model policy").
 */
type SparStateOnly = 'type' | 'value' | 'defaultValue' | 'onValueChange' | 'isCollapsible';

/**
 * Takeoff-vocabulary public props for the Accordion root. The adapter
 * translates these to Spar's `value` / `defaultValue` / `onValueChange` /
 * `type='single'|'multiple'` shape internally.
 */
export interface AccordionOwnProps {
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
   * Currently active item identifier(s) — controlled. Each value is an
   * {@link AccordionItemKey} that matches one item's `itemKey` (or its
   * positional index when `itemKey` is omitted).
   */
  activeIndex?: AccordionActiveIndex;
  /**
   * Initial active item identifier(s) — uncontrolled. Used only on mount.
   */
  defaultActiveIndex?: AccordionActiveIndex;
  /**
   * Fired exactly once per user-visible state change. The payload preserves
   * the original {@link AccordionItemKey} shape: items declared with numeric
   * `itemKey` (or auto-numbered) emit numbers; items declared with string
   * `itemKey` emit strings.
   */
  onActiveIndexChange?: (next: AccordionActiveIndex) => void;
  /**
   * When `true`, multiple panels can be expanded at once.
   * @defaultValue false
   */
  allowMultiple?: boolean;
  /**
   * Per-slot extra class names. Concatenated onto the canonical `tk-*` class
   * which is never dropped.
   */
  classNames?: ClassNamesMap<AccordionSlot>;
  /**
   * Per-slot HTML attribute overrides. Canonical `data-*` hooks always win on
   * conflict; instance entries override theme entries for unrelated keys.
   */
  slotProps?: SlotPropsMap<AccordionSlot>;
}

export type AccordionProps<T extends ElementType = 'div'> = Omit<SparAccordionProps<T>, SparStateOnly | 'classNames' | 'slotProps'> & AccordionOwnProps;

export interface AccordionItemOwnProps {
  /**
   * Stable identity for this item. Matches Takeoff Core's
   * `tk-accordion-item.itemKey`. When omitted, the root assigns a positional
   * numeric key based on declaration order. Pass a string when matching
   * against string-shaped `activeIndex`; pass a number for numeric-shaped
   * `activeIndex`. Mixing string and number itemKeys within one Accordion is
   * not supported.
   */
  itemKey?: AccordionItemKey;
  classNames?: ClassNamesMap<AccordionItemSlot>;
  slotProps?: SlotPropsMap<AccordionItemSlot>;
}

export type AccordionItemProps<T extends ElementType = 'div'> = Omit<SparAccordionItemProps<T>, 'value' | 'classNames' | 'slotProps'> & AccordionItemOwnProps;

export interface AccordionHeaderOwnProps {
  classNames?: ClassNamesMap<AccordionHeaderSlot>;
  slotProps?: SlotPropsMap<AccordionHeaderSlot>;
}

export type AccordionHeaderProps<T extends ElementType = 'h3'> = Omit<SparAccordionHeaderProps<T>, 'classNames' | 'slotProps'> & AccordionHeaderOwnProps;

export interface AccordionTriggerOwnProps {
  classNames?: ClassNamesMap<AccordionTriggerSlot>;
  slotProps?: SlotPropsMap<AccordionTriggerSlot>;
}

export type AccordionTriggerProps<T extends ElementType = 'button'> = Omit<SparAccordionTriggerProps<T>, 'classNames' | 'slotProps'> & AccordionTriggerOwnProps;

export interface AccordionContentOwnProps {
  classNames?: ClassNamesMap<AccordionContentSlot>;
  slotProps?: SlotPropsMap<AccordionContentSlot>;
}

export type AccordionContentProps<T extends ElementType = 'div'> = Omit<SparAccordionContentProps<T>, 'classNames' | 'slotProps'> & AccordionContentOwnProps;

export interface AccordionArrowOwnProps {
  children?: ReactNode;
  classNames?: ClassNamesMap<AccordionArrowSlot>;
  slotProps?: SlotPropsMap<AccordionArrowSlot>;
}

export type AccordionArrowProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'classNames' | 'slotProps'> & AccordionArrowOwnProps;
