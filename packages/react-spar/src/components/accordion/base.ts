import { createComponentBase } from '../../core';

import type {
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
  AccordionTriggerSlot,
  AccordionTriggerTitleProps,
} from './types';

// @archetype react-enhancement — Spar exposes only the leaf <button>; the wrapper
// owns the icon/title/arrow anatomy (canonical class + data-slot per slot).

export const AccordionBase = createComponentBase<AccordionProps, 'root'>({
  name: 'Accordion',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion' },
});

export const AccordionItemBase = createComponentBase<AccordionItemProps, 'root'>({
  name: 'AccordionItem',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item' },
});

// AccordionHeader has no takeoff-v2 visual layer — the heading element is
// styled upstream by `<SparAccordionHeader>`. The empty root class keeps the
// canonical `data-slot="root"` hook (for selector parity with other parts)
// without emitting an unused `tk-*` class.
export const AccordionHeaderBase = createComponentBase<AccordionHeaderProps, 'root'>({
  name: 'AccordionHeader',
  slots: ['root'] as const,
  classes: { root: '' },
});

export const AccordionTriggerBase = createComponentBase<AccordionTriggerProps, AccordionTriggerSlot>({
  name: 'AccordionTrigger',
  slots: ['root', 'icon', 'arrow'] as const,
  classes: {
    root: 'tk-accordion-item-header',
    icon: 'tk-accordion-item-icon',
    arrow: 'tk-accordion-item-arrow',
  },
});

export const AccordionTriggerTitleBase = createComponentBase<AccordionTriggerTitleProps, 'root'>({
  name: 'AccordionTriggerTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item-title' },
});

export const AccordionContentBase = createComponentBase<AccordionContentProps, 'root'>({
  name: 'AccordionContent',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item-content' },
});
