import { createComponentBase } from '../../core';

import { DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionContentProps, AccordionHeaderProps, AccordionItemProps, AccordionProps, AccordionTriggerProps } from './types';

export const AccordionBase = createComponentBase<AccordionProps, 'root'>({
  name: 'Accordion',
  slots: ['root'] as const,
  classes: { root: 'tk-accordion' },
  // `mode` is intentionally absent: the legacy `type='compact'` migration in
  // Accordion.tsx detects "consumer did not pass mode" and upgrades the value,
  // and that detection has to run before the default fallback fills in.
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
