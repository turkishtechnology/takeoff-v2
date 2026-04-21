import { resolveSlotClass } from '../../customization';
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
  const { className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionArrowProps;

  return (
    <span {...rest} className={resolveSlotClass(AccordionArrowBase.classes.root, className, theme?.className)} data-slot="root">
      {children ?? <DefaultChevron />}
    </span>
  );
};

AccordionArrow.displayName = 'AccordionArrow';
