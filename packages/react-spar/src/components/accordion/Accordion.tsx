import type { ElementType } from 'react';

import { Accordion as SparAccordion } from '@turkish-technology/spar';

import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionVariantProvider } from './context';
import { DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');
  const { type = DEFAULT_TYPE, size = DEFAULT_SIZE, className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionProps<T>;

  return (
    <AccordionVariantProvider value={{ type, size }}>
      <SparAccordion {...(rest as AccordionProps<T>)} className={resolveSlotClass(AccordionBase.classes.root, className, theme?.className)} data-slot="root">
        {children}
      </SparAccordion>
    </AccordionVariantProvider>
  );
};

Accordion.displayName = 'Accordion';
