import { createSafeContext } from '../../hooks';

import type { BreadcrumbSize } from './types';

export interface BreadcrumbOwnContextValue {
  size: BreadcrumbSize;
}

export const [BreadcrumbProvider, useBreadcrumbOwnContext] = createSafeContext<BreadcrumbOwnContextValue>('BreadcrumbProvider');
