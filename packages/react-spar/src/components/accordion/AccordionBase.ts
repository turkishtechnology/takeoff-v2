import type { ReactNode } from 'react';

import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

import type { AccordionItemProps, AccordionMode, AccordionProps, AccordionType } from './types';

export const accordionSlots = ['root'] as const;

export type AccordionSlot = (typeof accordionSlots)[number];

export const accordionClassNames = {
  root: 'tk-accordion',
} as const satisfies SlotClassNames<AccordionSlot>;

/**
 * Composition archetype classification (see
 * `packages/react-spar/docs/CODING_STANDARDS.md § Composition Archetypes`).
 *
 * `SparAccordion` ships a compound upstream; its semantic parts are all
 * inherited by our wrapper. Structural chrome (title, icon, arrow) has no
 * upstream counterpart and is react-enhancement.
 *
 * - `Accordion` root   — inherited. Delegates to `SparAccordion`; supplies the
 *   adapter-hook value/onValueChange translation.
 * - `Accordion.Item`   — inherited. Delegates to `SparAccordion.Item`.
 * - `Accordion.Header` — inherited. Delegates to
 *   `SparAccordion.Header > SparAccordion.Trigger`, both forced to
 *   `as="div"`. Rationale: upstream `SparAccordion.Trigger` defaults to a
 *   native `<button>`, which cannot legally nest interactive children; our
 *   header row composes an icon / title / arrow cluster and may itself need
 *   to contain a consumer-supplied secondary control. Rendering the trigger
 *   as a `<div>` preserves the ARIA and keyboard wiring Spar attaches while
 *   keeping the DOM nestable. The wrapper keeps `role="button"` and
 *   `tabIndex` because Spar emits them regardless of `as`.
 * - `Accordion.Content`— inherited. Delegates to `SparAccordion.Content` with
 *   `forceMount` so animation states have a stable tree.
 * - `Accordion.Title`  — react-enhancement.
 * - `Accordion.Icon`   — react-enhancement.
 * - `Accordion.Arrow`  — react-enhancement; function-as-children exposes
 *   `{ isOpen }` for consumer-rendered chevrons.
 */
export const AccordionBase = createComponentBase<AccordionProps, AccordionSlot>({
  name: 'Accordion',
  slots: accordionSlots,
  classNames: accordionClassNames,
  defaultProps: {
    allowMultiple: false,
    type: 'grouped',
    mode: 'default',
  },
});

export const accordionItemSlots = ['root', 'header', 'title', 'content', 'icon', 'arrow'] as const;

export type AccordionItemSlot = (typeof accordionItemSlots)[number];

export const accordionItemClassNames = {
  root: 'tk-accordion-item',
  header: 'tk-accordion-item-header',
  title: 'tk-accordion-item-title',
  content: 'tk-accordion-item-content',
  icon: 'tk-accordion-item-icon',
  arrow: 'tk-accordion-item-arrow',
} as const satisfies SlotClassNames<AccordionItemSlot>;

export const AccordionItemBase = createComponentBase<AccordionItemProps, AccordionItemSlot>({
  name: 'AccordionItem',
  slots: accordionItemSlots,
  classNames: accordionItemClassNames,
  defaultProps: {
    size: 'base',
  },
});

export type AccordionItemKey = string | number;

export interface AccordionAdapterContextValue {
  openItemValues: Set<string>;
  type: AccordionType;
  mode: AccordionMode;
  classNames: AccordionProps['classNames'];
  slotProps: AccordionProps['slotProps'];
}

export const [AccordionProvider, useAccordionContext] = createSafeContext<AccordionAdapterContextValue>('Accordion');

export interface AccordionItemContextValue {
  encodedValue: string;
  isOpen: boolean;
  size: NonNullable<AccordionItemProps['size']>;
  classNames: AccordionItemProps['classNames'];
  slotProps: AccordionItemProps['slotProps'];
}

export const [AccordionItemProvider, useAccordionItemContext] = createSafeContext<AccordionItemContextValue>('AccordionItem');

export const encodeAccordionItemValue = (value: AccordionItemKey): string => (typeof value === 'number' ? `n:${value}` : `s:${value}`);

export const decodeAccordionItemValue = (value: string): AccordionItemKey => {
  if (value.startsWith('n:')) {
    return Number(value.slice(2));
  }

  if (value.startsWith('s:')) {
    return value.slice(2);
  }

  return value;
};

/**
 * Arrow render input shared between default icon resolution and user-supplied
 * `<Accordion.Arrow>` render-prop children.
 */
export interface AccordionArrowRenderState {
  isOpen: boolean;
}

export type AccordionArrowChildren = ReactNode | ((state: AccordionArrowRenderState) => ReactNode);
