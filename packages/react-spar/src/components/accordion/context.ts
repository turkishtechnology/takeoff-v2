import { createSafeContext } from '../../utils';

import type { AccordionMode, AccordionSize, ViewType } from './types';

export interface AccordionVariantContextValue {
  viewType: ViewType;
  size: AccordionSize;
  mode: AccordionMode;
}

export const [AccordionVariantProvider, useAccordionVariant] = createSafeContext<AccordionVariantContextValue>('AccordionVariantProvider');
