import { createElement, type ReactNode } from 'react';

import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';
// TODO(takeoff-icons): Swap these placeholder SVGs for the official Takeoff
// icon components (currently `keyboard_arrow_down` / `keyboard_arrow_up` in
// takeoff-ui) before the first public release.
import { PlaceholderChevronDown, PlaceholderChevronUp } from '../../utils/placeholderIcons';

import type { AccordionArrowPosition, AccordionItemProps, AccordionMode, AccordionProps, AccordionType } from './types';

export const accordionSlots = ['root'] as const;

export type AccordionSlot = (typeof accordionSlots)[number];

export const accordionClassNames = {
  root: 'tk-accordion',
} as const satisfies SlotClassNames<AccordionSlot>;

export const AccordionBase = createComponentBase<AccordionProps, AccordionSlot>({
  name: 'Accordion',
  slots: accordionSlots,
  classNames: accordionClassNames,
  defaultProps: {
    allowMultiple: false,
    arrowPosition: 'right',
    expandIcon: createElement(PlaceholderChevronDown),
    collapseIcon: createElement(PlaceholderChevronUp),
    hideArrows: false,
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
  arrowPosition: AccordionArrowPosition;
  expandIcon: ReactNode;
  collapseIcon: ReactNode;
  hideArrows: boolean;
}

export const [AccordionProvider, useAccordionContext] = createSafeContext<AccordionAdapterContextValue>('Accordion');

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
