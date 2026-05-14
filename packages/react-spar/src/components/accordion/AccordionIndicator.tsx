import { type ElementType, type ReactNode } from 'react';
import { useAccordionItemContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionIndicatorBase } from './base';
import type { AccordionIndicatorProps } from './types';

// Default chevrons. Kept inline until the dedicated icon package lands; the
// `tk-accordion-item-indicator` recipe targets these via the wrapper class.
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

export const AccordionIndicator = <T extends ElementType = 'span'>(props: AccordionIndicatorProps<T>) => {
  const theme = useComponentTheme('AccordionIndicator');
  const { isOpen } = useAccordionItemContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(AccordionIndicatorBase, props as AccordionIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  const resolved = typeof children === 'function' ? children({ isOpen }) : (children ?? (isOpen ? DEFAULT_COLLAPSE_ICON : DEFAULT_EXPAND_ICON));

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

AccordionIndicator.displayName = 'Accordion.Indicator';
