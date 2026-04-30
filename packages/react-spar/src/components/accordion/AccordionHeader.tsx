import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeaderProps } from './types';

export const AccordionHeader = (props: AccordionHeaderProps) => {
  const theme = useComponentTheme('AccordionHeader');
  const { rootAttrs, rest } = composeRootAttrs(AccordionHeaderBase, props, theme);
  const { children, ...spar } = rest;

  return (
    <SparAccordionHeader {...spar} {...rootAttrs}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
