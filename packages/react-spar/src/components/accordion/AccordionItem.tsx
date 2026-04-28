import type { ElementType } from 'react';

import { AccordionItem as SparAccordionItem } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = <T extends ElementType = 'div'>(props: AccordionItemProps<T>) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionVariant('AccordionItem');
  const merged = AccordionItemBase.resolveProps(props as AccordionItemProps, theme?.defaultProps) as AccordionItemProps<T>;
  const { className, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionItemBase.getSlotProps('root', { className }), theme?.slotProps, 'root', theme?.classNames?.root ?? theme?.className);

  return (
    <SparAccordionItem {...(rest as AccordionItemProps<T>)} {...rootAttrs} data-type={type} data-mode={mode} data-size={size}>
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'AccordionItem';
