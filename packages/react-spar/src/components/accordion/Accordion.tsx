import type { ElementType } from 'react';

import { Accordion as SparAccordion } from '@turkish-technology/spar';

import { createComponentBase } from '../../base/createComponentBase';
import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionVariantProvider } from './context';
import { DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_VIEW_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const AccordionBase = createComponentBase<'root'>({ root: 'tk-accordion' });

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');
  const { viewType = DEFAULT_VIEW_TYPE, size = DEFAULT_SIZE, mode = DEFAULT_MODE, className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionProps<T>;

  return (
    <AccordionVariantProvider value={{ viewType, size, mode }}>
      <SparAccordion {...(rest as AccordionProps<T>)} className={resolveSlotClass(AccordionBase.classes.root, className, theme?.className)} data-slot="root">
        {children}
      </SparAccordion>
    </AccordionVariantProvider>
  );
};

Accordion.displayName = 'Accordion';
