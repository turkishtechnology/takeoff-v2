import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

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

/**
 * Composition archetype classification (see
 * `packages/react-spar/docs/CODING_STANDARDS.md § Composition Archetypes`).
 *
 * `SparDialog` ships a compound upstream; its semantic parts (root,
 * Content, Title, Description) are inherited by our wrapper. The dismiss
 * behavior (Escape + outside-click) lives on `SparDialog.Content` via
 * `useInteractOutside` / `handleKeyDown`, so the wrapper inherits it via
 * `Dialog.Panel` automatically.
 *
 * - `Dialog` root            — inherited. Delegates to `SparDialog`.
 * - `Dialog.Panel`           — inherited. Delegates to `SparDialog.Content`.
 *   Where the focus trap, outside-click dismiss, and Escape dismiss live.
 *   `preventDismiss` is enforced at the root's `onOpenChange` handler (which
 *   Spar routes Escape + outside-click through), so the panel itself stays
 *   a thin delegator.
 * - `Dialog.Title`           — inherited. Delegates to `SparDialog.Title`.
 * - `Dialog.Description`     — inherited. Delegates to `SparDialog.Description`.
 * - `Dialog.Mask`            — react-enhancement. `SparDialog.Overlay` exists
 *   upstream but is not on the dismiss path `SparDialog.Content` already owns;
 *   our mask adds `maskVariant`, `isMaskBlur`, `hideBackdrop`, and the
 *   body-scroll-lock lifecycle — visual features Overlay does not offer.
 * - `Dialog.CloseButton`     — bypass. `SparDialog.Close` exists upstream but
 *   its `useCloseButton` helper does not call `event.stopPropagation()` on
 *   the click; our implementation does, to prevent the close click from also
 *   registering as a pointer-down-outside on `SparDialog.Content`. The
 *   rendered DOM remains a native `<button type="button">`, so Enter/Space
 *   activation is inherited from the browser — no keyboard re-implementation.
 * - `Dialog.Header`, `Dialog.TitleGroup`, `Dialog.SignIcon`, `Dialog.Body`,
 *   `Dialog.Footer`, `Dialog.FooterActions` — react-enhancement. No upstream
 *   counterparts; these are structural chrome specific to the Takeoff dialog
 *   anatomy.
 */
export const DialogBase = createComponentBase<DialogProps, DialogSlot>({
  name: 'Dialog',
  slots: dialogSlots,
  classNames: dialogClassNames,
  defaultProps: {
    visible: undefined,
    defaultVisible: false,
    headerType: 'basic',
    variant: 'info',
    hideBackdrop: false,
    maskVariant: 'base',
    isMaskBlur: false,
    containerStyle: null,
    preventDismiss: false,
    portalContainer: undefined,
  },
});

export interface DialogContextValue {
  visible: boolean;
  variant: NonNullable<DialogProps['variant']>;
  headerType: NonNullable<DialogProps['headerType']>;
  maskVariant: NonNullable<DialogProps['maskVariant']>;
  hideBackdrop: boolean;
  isMaskBlur: boolean;
  portalContainer: HTMLElement | null;
  requestClose: () => void;
  classNames: DialogProps['classNames'];
  slotProps: DialogProps['slotProps'];
}

export const [DialogProvider, useDialogContext] = createSafeContext<DialogContextValue>('Dialog');
