import { createSafeContext } from '../../utils';

import type { AccordionMode, AccordionSize, AccordionType } from './types';

/**
 * Context value handed to descendant subcomponents. The legacy `'compact'`
 * value is normalized away before the provider mounts, so subcomponents only
 * see the canonical visual-grouping vocabulary.
 */
export interface AccordionVariantContextValue {
  type: Exclude<AccordionType, 'compact'>;
  mode: AccordionMode;
  size: AccordionSize;
}

export const [AccordionVariantProvider, useAccordionVariant] = createSafeContext<AccordionVariantContextValue>('AccordionVariantProvider');
