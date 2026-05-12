import type { ReactNode } from 'react';

import { createSafeContext } from '../../hooks';

import type { AccordionArrowPosition, AccordionMode, AccordionSize, AccordionType } from './types';

export interface AccordionOwnContextValue {
  type: AccordionType;
  mode: AccordionMode;
  size: AccordionSize;
  arrowPosition: AccordionArrowPosition;
  hideArrows: boolean;
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
}

export const [AccordionProvider, useAccordionOwnContext] = createSafeContext<AccordionOwnContextValue>('AccordionProvider');
