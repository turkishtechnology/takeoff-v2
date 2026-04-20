import type { ElementType } from 'react';

import { AccordionTrigger as SparAccordionTrigger } from '@turkish-technology/spar';

import { createComponentBase } from '../../base/createComponentBase';
import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import type { AccordionTriggerProps } from './types';

export const AccordionTriggerBase = createComponentBase<'root'>({ root: 'tk-accordion-item-header' });

export const AccordionTrigger = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');
  const { className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionTriggerProps<T>;

  return (
    <SparAccordionTrigger {...(rest as AccordionTriggerProps<T>)} className={resolveSlotClass(AccordionTriggerBase.classes.root, className, theme?.className)} data-slot="root">
      {children}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';
