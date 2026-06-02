import { createSafeContext } from '../../hooks';
import type { DialogVariant } from './types';

export interface DialogOwnContextValue {
  dismissable: boolean;
  variant: DialogVariant;
}

export const [DialogProvider, useDialogOwnContext] = createSafeContext<DialogOwnContextValue>('DialogProvider');
