import { AccordionContent as SparAccordionContent, useCollapsibleContext } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionContentBase } from './base';
import type { AccordionContentProps } from './types';

export const AccordionContent = (props: AccordionContentProps) => {
  const theme = useComponentTheme('AccordionContent');
  // Reading the same context Spar's CollapsibleContent uses keeps `data-open`
  // attached even when `forceMount` keeps a closed panel rendered.
  const { isOpen } = useCollapsibleContext();
  const merged = AccordionContentBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionContentBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionContent {...rest} {...rootAttrs} data-open={isOpen ? '' : undefined}>
      {children}
    </SparAccordionContent>
  );
};

AccordionContent.displayName = 'Accordion.Content';
