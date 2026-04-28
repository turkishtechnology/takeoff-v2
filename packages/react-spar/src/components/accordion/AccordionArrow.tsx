import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionArrowBase } from './base';
import type { AccordionArrowProps } from './types';

// TODO: Tk icons lar ile değiştirilecek
const DefaultChevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AccordionArrow = (props: AccordionArrowProps) => {
  const theme = useComponentTheme('AccordionArrow');
  const merged = AccordionArrowBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionArrowBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <span {...rest} {...rootAttrs}>
      {children ?? <DefaultChevron />}
    </span>
  );
};

AccordionArrow.displayName = 'Accordion.Arrow';
