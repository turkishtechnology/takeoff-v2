import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeaderProps } from './types';

export const AccordionHeader = (props: AccordionHeaderProps) => {
  const theme = useComponentTheme('AccordionHeader');
  const merged = AccordionHeaderBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionHeaderBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionHeader {...rest} {...rootAttrs}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
