import { AccordionContent as SparAccordionContent, useCollapsibleContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionContentBase } from './base';
import type { AccordionContentProps } from './types';

export const AccordionContent = (props: AccordionContentProps) => {
  const theme = useComponentTheme('AccordionContent');
  const { rootAttrs, rest } = composeRootAttrs(AccordionContentBase, props, theme);
  const { children, ...spar } = rest;

  // Reading the same context Spar's CollapsibleContent uses keeps `data-open`
  // attached even when `forceMount` keeps a closed panel rendered.
  const { isOpen } = useCollapsibleContext();

  return (
    <SparAccordionContent {...spar} {...rootAttrs} data-open={isOpen ? '' : undefined}>
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'Accordion.Content';
