import { createSafeContext } from '../../utils';

import type { AccordionSize, AccordionType } from './types';

export interface AccordionVariantContextValue {
  type: AccordionType;
  size: AccordionSize;
}

export const [AccordionVariantProvider, useAccordionVariant] = createSafeContext<AccordionVariantContextValue>('AccordionVariantProvider');
