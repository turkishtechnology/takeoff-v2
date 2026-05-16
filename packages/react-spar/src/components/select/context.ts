import { createSafeContext } from '../../hooks';

import type { SelectSize } from './types';

export interface SelectOwnContextValue {
  size: SelectSize;
  invalid: boolean;
}

export const [SelectProvider, useSelectOwnContext] = createSafeContext<SelectOwnContextValue>('SelectProvider');
