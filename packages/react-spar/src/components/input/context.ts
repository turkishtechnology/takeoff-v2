import { createSafeContext } from '../../hooks';

import type { InputSize } from './types';

export interface InputOwnContextValue {
  size: InputSize;
}

export const [InputProvider, useInputOwnContext] = createSafeContext<InputOwnContextValue>('InputProvider');
