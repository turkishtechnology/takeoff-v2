import { createSafeContext } from '../../hooks';

import type { BreadcrumbSize, BreadcrumbType } from './types';

export interface BreadcrumbOwnContextValue {
  size: BreadcrumbSize;
  type: BreadcrumbType;
}

export const [BreadcrumbProvider, useBreadcrumbOwnContext] = createSafeContext<BreadcrumbOwnContextValue>('BreadcrumbProvider');
