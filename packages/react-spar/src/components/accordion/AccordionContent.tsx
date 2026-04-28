import type { ElementType } from 'react';

import { AccordionContent as SparAccordionContent, type AccordionContentProps as SparAccordionContentProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionContentBase } from './base';
import type { AccordionContentProps } from './types';

export const AccordionContent = <T extends ElementType = 'div'>(props: AccordionContentProps<T>) => {
  const theme = useComponentTheme('AccordionContent');
  const merged = AccordionContentBase.resolveProps(props as AccordionContentProps, theme?.defaultProps) as AccordionContentProps<T>;
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionContentBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionContent {...(rest as SparAccordionContentProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'Accordion.Content';
