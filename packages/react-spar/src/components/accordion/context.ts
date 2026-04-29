import type { ReactNode } from 'react';

import { createSafeContext } from '../../hooks';

import type { AccordionArrowPosition, AccordionMode, AccordionSize, AccordionType } from './types';

/**
 * Visual state cascaded from the root to descendant subcomponents.
 *
 * `type` is narrowed: the legacy `'compact'` value is normalized away in
 * `Accordion.tsx` before this provider mounts, so subcomponents only see the
 * canonical grouping vocabulary. The arrow visuals live here so the trigger
 * can render its own arrow span without consumers placing it manually.
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
