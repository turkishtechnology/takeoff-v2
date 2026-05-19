import { createSafeContext } from '../../hooks';

import type { SelectContentWidth, SelectSize } from './types';

export interface SelectOwnContextValue {
  size: SelectSize;
  invalid: boolean;
  contentWidth: SelectContentWidth;
}

export const [SelectProvider, useSelectOwnContext] = createSafeContext<SelectOwnContextValue>('SelectProvider');
