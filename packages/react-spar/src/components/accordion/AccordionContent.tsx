import { AccordionContent as SparAccordionContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionContentBase } from './base';
import type { AccordionContentProps } from './types';

export const AccordionContent = (props: AccordionContentProps) => {
  const theme = useComponentTheme('AccordionContent');
  const { rootAttrs, rest } = composeRootAttrs(AccordionContentBase, props, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparAccordionContent {...spar} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'Accordion.Content';
