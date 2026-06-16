import { createSafeContext } from '../../hooks';

export interface DialogOwnContextValue {
  dismissible: boolean;
}

export const [DialogProvider, useDialogOwnContext] = createSafeContext<DialogOwnContextValue>('DialogProvider');
