import { Children, isValidElement, type ElementType, type ReactNode } from 'react';

import { AccordionTrigger as SparAccordionTrigger } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionIndicator } from './AccordionIndicator';
import { AccordionTriggerBase } from './base';
import type { AccordionTriggerProps } from './types';

export const AccordionTrigger = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');

  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerBase, props as AccordionTriggerProps<'button'>, theme);
  const { children, startContent, ref, ...spar } = rest;

  const slotLayers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };

  const startContentNode = startContent !== undefined && startContent !== null && (
    <span {...buildSlotAttrs(AccordionTriggerBase.getSlotProps('startContent'), 'startContent', slotLayers)}>{startContent}</span>
  );

  // Split direct children into title content and standalone indicators so the
  // `tk-accordion-item-title` slot keeps `flex-grow: 1` and pushes any sibling
  // indicator to the opposite edge — consumers drop in text and an
  // `<Accordion.Indicator />` without reaching for a compound title part.
  const inlineNodes: ReactNode[] = [];
  let titleBuffer: ReactNode[] = [];
  let titleKey = 0;
  const flushTitle = () => {
    if (titleBuffer.length === 0) return;
    inlineNodes.push(
      <span key={`title-${titleKey++}`} {...buildSlotAttrs(AccordionTriggerBase.getSlotProps('title'), 'title', slotLayers)}>
        {titleBuffer}
      </span>,
    );
    titleBuffer = [];
  };

  Children.toArray(children).forEach(child => {
    if (isValidElement(child) && child.type === AccordionIndicator) {
      flushTitle();
      inlineNodes.push(child);
    } else {
      titleBuffer.push(child);
    }
  });
  flushTitle();

  return (
    <SparAccordionTrigger {...spar} {...rootAttrs} ref={ref}>
      {startContentNode}
      {inlineNodes}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'Accordion.Trigger';
