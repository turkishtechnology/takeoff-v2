import type { ElementType } from 'react';
import { AccordionItem as SparAccordionItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionOwnContext } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = <T extends ElementType = 'div'>(props: AccordionItemProps<T>) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionOwnContext('Accordion.Item');

  const { rootAttrs, rest } = composeRootAttrs(AccordionItemBase, props as AccordionItemProps<'div'>, theme, {
    stateAttrs: {
      'data-type': type,
      'data-mode': mode,
      'data-size': size,
    },
  });
  const { children, ref, ...spar } = rest;

  return (
    <SparAccordionItem {...spar} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
