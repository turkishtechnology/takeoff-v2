import type { ToastType, ToastVariant } from './types';

export const toastTypeToVariant = (type: ToastType): ToastVariant => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'default':
    case 'loading':
    default:
      return 'neutral';
  }
};
