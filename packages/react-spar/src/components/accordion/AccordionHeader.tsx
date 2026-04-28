import type { ElementType } from 'react';

import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeaderProps } from './types';

export const AccordionHeader = <T extends ElementType = 'h3'>(props: AccordionHeaderProps<T>) => {
  const theme = useComponentTheme('AccordionHeader');
  const merged = AccordionHeaderBase.resolveProps(props as AccordionHeaderProps, theme?.defaultProps) as AccordionHeaderProps<T>;
  const { className, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionHeaderBase.getSlotProps('root', { className }), theme?.slotProps, 'root', theme?.classNames?.root ?? theme?.className);

  return (
    <SparAccordionHeader {...(rest as AccordionHeaderProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'AccordionHeader';
