import { createSafeContext } from '../../hooks';

export interface DialogOwnContextValue {
  dismissable: boolean;
}

export const [DialogProvider, useDialogOwnContext] = createSafeContext<DialogOwnContextValue>('DialogProvider');
