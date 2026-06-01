import type { Dispatch, RefObject, SetStateAction } from 'react';
import { createSafeContext } from '../../hooks';

import type { InputSize } from './types';

export interface InputOwnContextValue {
  size: InputSize;
  fieldRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  fieldValue: string;
  setFieldValue: Dispatch<SetStateAction<string>>;
  revealed: boolean;
  setRevealed: Dispatch<SetStateAction<boolean>>;
  toggleReveal: () => void;
}

export const [InputProvider, useInputOwnContext] = createSafeContext<InputOwnContextValue>('InputProvider');
