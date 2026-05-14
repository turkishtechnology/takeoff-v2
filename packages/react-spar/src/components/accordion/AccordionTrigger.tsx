import { type ElementType } from 'react';

import { AccordionTrigger as SparAccordionTrigger } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { hasChildOfType } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase, AccordionTriggerTitleBase } from './base';
import type { AccordionTriggerProps, AccordionTriggerTitleProps } from './types';

const AccordionTriggerTitle = <T extends ElementType = 'span'>(props: AccordionTriggerTitleProps<T>) => {
  const theme = useComponentTheme('AccordionTriggerTitle');
  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerTitleBase, props as AccordionTriggerTitleProps<'span'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <span {...spar} {...rootAttrs} ref={ref}>
      {children}
    </span>
  );
};

AccordionTriggerTitle.displayName = 'Accordion.Trigger.Title';

const AccordionTriggerRoot = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');

  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerBase, props as AccordionTriggerProps<'button'>, theme);
  const { children, startContent, ref, ...spar } = rest;

  const childHasTitle = hasChildOfType(children, AccordionTriggerTitle);

  const startContentNode = startContent !== undefined && startContent !== null && (
    <span
      {...buildSlotAttrs(AccordionTriggerBase.getSlotProps('startContent'), 'startContent', {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        instanceSlotProps: props.slotProps,
        instanceClassNames: props.classNames,
      })}
    >
      {startContent}
    </span>
  );

  const titleNode = childHasTitle ? children : <AccordionTriggerTitle>{children}</AccordionTriggerTitle>;

  return (
    <SparAccordionTrigger {...spar} {...rootAttrs} ref={ref}>
      {startContentNode}
      {titleNode}
    </SparAccordionTrigger>
  );
};

AccordionTriggerRoot.displayName = 'Accordion.Trigger';

export const AccordionTrigger = Object.assign(AccordionTriggerRoot, {
  Title: AccordionTriggerTitle,
});
