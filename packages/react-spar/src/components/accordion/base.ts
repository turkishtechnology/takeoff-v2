import { createComponentBase } from '../../styling/createComponentBase';

import { DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionContentProps, AccordionHeaderProps, AccordionItemProps, AccordionProps, AccordionTriggerProps } from './types';

/**
 * One `createComponentBase` instance per registered customization key. Each
 * entry today exposes a single canonical `root` slot; multi-slot keys can be
 * widened later without touching the helper API.
 */
export const AccordionBase = createComponentBase<AccordionProps, 'root'>({
  name: 'Accordion',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion' },
  // `mode` is intentionally absent from the author defaults: the legacy
  // `type='compact'` migration in Accordion.tsx needs to detect "consumer did
  // not pass mode" so it can upgrade to `mode='compact'`. The DEFAULT_MODE
  // fallback is applied by `normalizeTypeAndMode` after that detection.
  defaultProps: { type: DEFAULT_TYPE, size: DEFAULT_SIZE },
});

export const AccordionItemBase = createComponentBase<AccordionItemProps, 'root'>({
  name: 'AccordionItem',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item' },
});

export const AccordionHeaderBase = createComponentBase<AccordionHeaderProps, 'root'>({
  name: 'AccordionHeader',
  slots: ['root'] as const,
  classes: { root: '' },
});

export const AccordionTriggerBase = createComponentBase<AccordionTriggerProps, 'root'>({
  name: 'AccordionTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item-header' },
});

export const AccordionContentBase = createComponentBase<AccordionContentProps, 'root'>({
  name: 'AccordionContent',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion-item-content' },
});
