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

export type AccordionSlot = 'root';
export type AccordionItemSlot = 'root';
export type AccordionHeaderSlot = 'root';
export type AccordionTriggerSlot = 'root' | 'startContent';
export type AccordionTriggerTitleSlot = 'root';
export type AccordionIndicatorSlot = 'root';
export type AccordionContentSlot = 'root';

/**
 * State surface delivered to {@link AccordionIndicatorProps.children} when
 * passed as a render function. Lets consumers swap icons by open state without
 * pulling the item context themselves.
 */
export interface AccordionIndicatorRenderState {
  isOpen: boolean;
}

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
   * Leading content rendered before the title — typically an icon, but
   * accepts any node. The wrapper element (class + `data-slot`) is invariant;
   * only the inner node is consumer-supplied.
   */
  startContent?: ReactNode;
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

export interface AccordionIndicatorOwnProps {
  /**
   * Override the default chevron. Accepts a ReactNode (rendered in every
   * state) or a render function receiving the live `{ isOpen }` state — use
   * the render-prop form to swap icons by open state without consuming the
   * item context manually.
   */
  children?: ReactNode | ((state: AccordionIndicatorRenderState) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<AccordionIndicatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<AccordionIndicatorSlot>;
}

export type AccordionIndicatorProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  AccordionIndicatorOwnProps
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
    AccordionIndicator: import('../../core').ComponentThemeConfig<AccordionIndicatorProps, AccordionIndicatorSlot>;
    AccordionContent: import('../../core').ComponentThemeConfig<AccordionContentProps>;
  }
}
