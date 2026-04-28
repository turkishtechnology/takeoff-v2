import type { ElementType } from 'react';

import { AccordionHeader as SparAccordionHeader, type AccordionHeaderProps as SparAccordionHeaderProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeaderProps } from './types';

export const AccordionHeader = <T extends ElementType = 'h3'>(props: AccordionHeaderProps<T>) => {
  const theme = useComponentTheme('AccordionHeader');
  const merged = AccordionHeaderBase.resolveProps(props as AccordionHeaderProps, theme?.defaultProps) as AccordionHeaderProps<T>;
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionHeaderBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionHeader {...(rest as SparAccordionHeaderProps<T>)} {...rootAttrs}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
