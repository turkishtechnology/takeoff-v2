import type { ReactNode } from 'react';

import { AccordionTrigger as SparAccordionTrigger, useAccordionItemContext } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionArrowPosition, AccordionTriggerProps } from './types';

const DefaultExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DefaultCollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const renderArrow = (isOpen: boolean, expandIcon: ReactNode, collapseIcon: ReactNode, arrowPosition: AccordionArrowPosition): ReactNode => (
  <span className="tk-accordion-item-arrow" aria-hidden="true" data-state={isOpen ? 'open' : 'closed'} data-position={arrowPosition}>
    {isOpen ? (collapseIcon ?? <DefaultCollapseIcon />) : (expandIcon ?? <DefaultExpandIcon />)}
  </span>
);

export const AccordionTrigger = (props: AccordionTriggerProps) => {
  const theme = useComponentTheme('AccordionTrigger');
  const { arrowPosition, hideArrows, expandIcon, collapseIcon } = useAccordionVariant('Accordion.Trigger');
  const { isOpen } = useAccordionItemContext();
  const merged = AccordionTriggerBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionTriggerBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const arrow = hideArrows ? null : renderArrow(isOpen, expandIcon, collapseIcon, arrowPosition);

  return (
    <SparAccordionTrigger {...rest} {...rootAttrs}>
      {arrowPosition === 'left' && arrow}
      <span className="tk-accordion-item-trigger-label">{children}</span>
      {arrowPosition === 'right' && arrow}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'Accordion.Trigger';
