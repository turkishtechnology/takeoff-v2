import type { ElementType } from 'react';
import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeaderProps } from './types';

export const AccordionHeader = <T extends ElementType = 'h3'>(props: AccordionHeaderProps<T>) => {
  const theme = useComponentTheme('AccordionHeader');
  const { rootAttrs, rest } = composeRootAttrs(AccordionHeaderBase, props as AccordionHeaderProps<'h3'>, theme);
  const { children, level, ref, ...spar } = rest;

  return (
    <SparAccordionHeader {...spar} level={level} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
