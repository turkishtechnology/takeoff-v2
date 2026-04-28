import type { ReactNode } from 'react';

import { createSafeContext } from '../../utils';

import type { AccordionArrowPosition, AccordionMode, AccordionSize, AccordionType } from './types';

/**
 * Context value handed to descendant subcomponents. The legacy `'compact'`
 * value of {@link AccordionType} is normalized away before the provider
 * mounts, so subcomponents only see the canonical visual-grouping vocabulary.
 *
 * The arrow visual props live on the root and cascade through this context
 * so {@link AccordionTrigger} can render the arrow without consumers having
 * to place it manually.
 */
export interface AccordionVariantContextValue {
  type: Exclude<AccordionType, 'compact'>;
  mode: AccordionMode;
  size: AccordionSize;
  arrowPosition: AccordionArrowPosition;
  hideArrows: boolean;
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
}

export const [AccordionVariantProvider, useAccordionVariant] = createSafeContext<AccordionVariantContextValue>('AccordionVariantProvider');
