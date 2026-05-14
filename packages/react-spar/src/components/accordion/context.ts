import { createSafeContext } from '../../hooks';

import type { AccordionMode, AccordionSize, AccordionType } from './types';

export interface AccordionOwnContextValue {
  type: AccordionType;
  mode: AccordionMode;
  size: AccordionSize;
}

export const [AccordionProvider, useAccordionOwnContext] = createSafeContext<AccordionOwnContextValue>('AccordionProvider');
