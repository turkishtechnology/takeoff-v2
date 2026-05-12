import { AccordionItem as SparAccordionItem, type AccordionItemProps as SparAccordionItemProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionOwnContext } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = (props: AccordionItemProps) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionOwnContext('Accordion.Item');

  const { rootAttrs, rest } = composeRootAttrs(AccordionItemBase, props, theme, {
    stateAttrs: {
      'data-type': type,
      'data-mode': mode,
      'data-size': size,
    },
  });
  const { value, children, ref, ...spar } = rest;

  return (
    <SparAccordionItem {...(spar as SparAccordionItemProps)} value={value} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
