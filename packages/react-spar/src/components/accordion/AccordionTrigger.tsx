import type { ElementType } from 'react';

import { AccordionTrigger as SparAccordionTrigger } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase } from './base';
import type { AccordionTriggerProps } from './types';

export const AccordionTrigger = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');
  const merged = AccordionTriggerBase.resolveProps(props as AccordionTriggerProps, theme?.defaultProps) as AccordionTriggerProps<T>;
  const { className, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionTriggerBase.getSlotProps('root', { className }), theme?.slotProps, 'root', theme?.classNames?.root ?? theme?.className);

  return (
    <SparAccordionTrigger {...(rest as AccordionTriggerProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';
