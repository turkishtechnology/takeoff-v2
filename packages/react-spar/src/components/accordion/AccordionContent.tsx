import type { ElementType } from 'react';

import { AccordionContent as SparAccordionContent } from '@turkish-technology/spar';

import { createComponentBase } from '../../base/createComponentBase';
import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import type { AccordionContentProps } from './types';

export const AccordionContentBase = createComponentBase<'root'>({ root: 'tk-accordion-item-content' });

export const AccordionContent = <T extends ElementType = 'div'>(props: AccordionContentProps<T>) => {
  const theme = useComponentTheme('AccordionContent');
  const { className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionContentProps<T>;

  return (
    <SparAccordionContent {...(rest as AccordionContentProps<T>)} className={resolveSlotClass(AccordionContentBase.classes.root, className, theme?.className)} data-slot="root">
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'AccordionContent';
