import type { ElementType } from 'react';

import { AccordionItem as SparAccordionItem } from '@turkish-technology/spar';

import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = <T extends ElementType = 'div'>(props: AccordionItemProps<T>) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, size } = useAccordionVariant('AccordionItem');
  const { className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionItemProps<T>;

  return (
    <SparAccordionItem
      {...(rest as AccordionItemProps<T>)}
      className={resolveSlotClass(AccordionItemBase.classes.root, className, theme?.className)}
      data-slot="root"
      data-type={type}
      data-size={size}
    >
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'AccordionItem';
