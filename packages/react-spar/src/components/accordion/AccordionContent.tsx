import type { ElementType } from 'react';

import { AccordionContent as SparAccordionContent } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionContentBase } from './base';
import type { AccordionContentProps } from './types';

export const AccordionContent = <T extends ElementType = 'div'>(props: AccordionContentProps<T>) => {
  const theme = useComponentTheme('AccordionContent');
  const merged = AccordionContentBase.resolveProps(props as AccordionContentProps, theme?.defaultProps) as AccordionContentProps<T>;
  const { className, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionContentBase.getSlotProps('root', { className }), theme?.slotProps, 'root', theme?.classNames?.root ?? theme?.className);

  return (
    <SparAccordionContent {...(rest as AccordionContentProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'AccordionContent';
