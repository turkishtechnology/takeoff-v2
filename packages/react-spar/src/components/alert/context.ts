import { createSafeContext } from '../../hooks';

export interface AlertContextValue {
  onClose?: () => void;
}

export const [AlertProvider, useAlertContext] = createSafeContext<AlertContextValue>('AlertProvider');
