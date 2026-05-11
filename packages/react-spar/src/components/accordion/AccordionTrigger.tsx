import type { ReactNode } from 'react';

import { AccordionTrigger as SparAccordionTrigger, useAccordionItemContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase } from './base';
import { useAccordionOwnContext } from './context';
import type { AccordionArrowPosition, AccordionTriggerProps } from './types';

const DEFAULT_EXPAND_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DEFAULT_COLLAPSE_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface AccordionArrowProps {
  isOpen: boolean;
  arrowPosition: AccordionArrowPosition;
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
}

const AccordionArrow = ({ isOpen, arrowPosition, expandIcon, collapseIcon }: AccordionArrowProps) => (
  <span className="tk-accordion-item-arrow" aria-hidden="true" data-position={arrowPosition}>
    {isOpen ? (collapseIcon ?? DEFAULT_COLLAPSE_ICON) : (expandIcon ?? DEFAULT_EXPAND_ICON)}
  </span>
);

export const AccordionTrigger = (props: AccordionTriggerProps) => {
  const theme = useComponentTheme('AccordionTrigger');
  const { arrowPosition, hideArrows, expandIcon, collapseIcon } = useAccordionOwnContext('Accordion.Trigger');
  const { isOpen } = useAccordionItemContext();

  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerBase, props, theme);
  const { children, ref, ...spar } = rest;

  const arrow = hideArrows ? null : <AccordionArrow isOpen={isOpen} arrowPosition={arrowPosition} expandIcon={expandIcon} collapseIcon={collapseIcon} />;

  return (
    <SparAccordionTrigger {...spar} {...rootAttrs} ref={ref}>
      {arrowPosition === 'left' && arrow}
      <span className="tk-accordion-item-title">{children}</span>
      {arrowPosition === 'right' && arrow}
    </SparAccordionTrigger>
  );
};

AccordionTrigger.displayName = 'Accordion.Trigger';
