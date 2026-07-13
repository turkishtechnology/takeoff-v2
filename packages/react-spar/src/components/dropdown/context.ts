import { createSafeContext } from '../../hooks';

import type { DropdownContentWidth, DropdownSize } from './types';

export interface DropdownOwnContextValue {
  size: DropdownSize;
  contentWidth: DropdownContentWidth;
}

export const [DropdownProvider, useDropdownOwnContext] = createSafeContext<DropdownOwnContextValue>('DropdownProvider');
