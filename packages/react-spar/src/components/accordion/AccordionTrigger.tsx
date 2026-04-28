import type { ElementType } from 'react';

import { AccordionTrigger as SparAccordionTrigger, type AccordionTriggerProps as SparAccordionTriggerProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase } from './base';
import type { AccordionTriggerProps } from './types';

export const AccordionTrigger = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');
  const merged = AccordionTriggerBase.resolveProps(props as AccordionTriggerProps, theme?.defaultProps) as AccordionTriggerProps<T>;
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionTriggerBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionTrigger {...(rest as SparAccordionTriggerProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'Accordion.Trigger';
