import { AccordionItem as SparAccordionItem, type AccordionItemProps as SparAccordionItemProps, useAccordionContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionActiveIndex, AccordionItemKey, AccordionItemProps } from './types';

const isItemActive = (activeIndex: AccordionActiveIndex | undefined, itemKey: AccordionItemKey, allowMultiple: boolean | undefined): boolean => {
  if (allowMultiple) {
    return Array.isArray(activeIndex) && activeIndex.includes(itemKey);
  }
  return activeIndex === itemKey;
};

export const AccordionItem = (props: AccordionItemProps) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionVariant('Accordion.Item');
  const { activeIndex, allowMultiple } = useAccordionContext();

  const { rootAttrs, rest } = composeRootAttrs(AccordionItemBase, props, theme);
  const { itemKey, children, ref, ...spar } = rest;

  const isOpen = isItemActive(activeIndex, itemKey, allowMultiple);
  const itemClassName = AccordionItemBase.cx(rootAttrs.className, type, mode, size, isOpen && 'open');

  return (
    <SparAccordionItem
      {...(spar as SparAccordionItemProps)}
      itemKey={itemKey}
      {...rootAttrs}
      ref={ref}
      className={itemClassName}
      data-type={type}
      data-mode={mode}
      data-size={size}
      data-open={isOpen ? '' : undefined}
    >
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
