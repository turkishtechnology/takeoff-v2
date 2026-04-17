import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';

import type { DialogProps } from './types';

export const dialogSlots = [
  'root',
  'mask',
  'header',
  'headerContent',
  'titleContainer',
  'title',
  'subtitle',
  'signIcon',
  'closeButton',
  'closeIcon',
  'content',
  'footer',
  'footerActions',
] as const;

export type DialogSlot = (typeof dialogSlots)[number];

export const dialogClassNames = {
  root: 'tk-dialog',
  mask: 'tk-dialog-mask',
  header: 'tk-dialog-header',
  headerContent: 'tk-dialog-header-content',
  titleContainer: 'tk-dialog-title-container',
  title: 'tk-dialog-title',
  subtitle: 'tk-dialog-subtitle',
  signIcon: 'tk-dialog-sign-icon',
  closeButton: 'tk-dialog-header-close-button',
  closeIcon: 'tk-dialog-close-icon',
  content: 'tk-dialog-content',
  footer: 'tk-dialog-footer',
  footerActions: 'tk-dialog-footer-actions',
} as const satisfies SlotClassNames<DialogSlot>;

export const DialogBase = createComponentBase<DialogProps, DialogSlot>({
  name: 'Dialog',
  slots: dialogSlots,
  classNames: dialogClassNames,
  defaultProps: {
    visible: undefined,
    defaultVisible: false,
    headerType: 'basic',
    showCloseButton: true,
    showHeader: true,
    showVariantSign: true,
    variant: 'info',
    hideBackdrop: false,
    maskVariant: 'base',
    isMaskBlur: false,
    containerStyle: null,
    preventDismiss: false,
    portalContainer: undefined,
  },
});
