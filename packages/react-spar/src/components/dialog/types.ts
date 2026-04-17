import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, CSSProperties, HTMLAttributes, ReactNode } from 'react';

import type { DialogSlot } from './DialogBase';
import type { ClassNamesOverride } from '../../customization/overrides';

export type DialogHeaderType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export type DialogVariant = 'success' | 'info' | 'warning' | 'danger';

export type DialogMaskVariant = 'lightest' | 'light' | 'base' | 'dark' | 'darkest';

export interface DialogSlotProps {
  root?: HTMLAttributes<HTMLDivElement>;
  mask?: HTMLAttributes<HTMLDivElement>;
  header?: HTMLAttributes<HTMLDivElement>;
  headerContent?: HTMLAttributes<HTMLDivElement>;
  titleContainer?: HTMLAttributes<HTMLDivElement>;
  title?: HTMLAttributes<HTMLSpanElement>;
  subtitle?: HTMLAttributes<HTMLSpanElement>;
  signIcon?: HTMLAttributes<HTMLSpanElement>;
  closeButton?: ButtonHTMLAttributes<HTMLButtonElement>;
  closeIcon?: HTMLAttributes<HTMLSpanElement>;
  content?: HTMLAttributes<HTMLDivElement>;
  footer?: HTMLAttributes<HTMLDivElement>;
  footerActions?: HTMLAttributes<HTMLDivElement>;
}

type DialogNativeProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export interface DialogProps extends DialogNativeProps {
  /**
   * Controls the visibility of the dialog.
   */
  visible?: boolean;
  /**
   * Initial visibility for uncontrolled usage.
   * @defaultValue false
   */
  defaultVisible?: boolean;
  /**
   * Fired when the dialog requests a visibility change from user interaction.
   */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * Fired when the dialog opens because the `visible` state changes to `true`.
   */
  onOpen?: () => void;
  /**
   * Fired when the dialog closes or requests to close.
   */
  onClose?: () => void;
  /**
   * The header text.
   */
  header?: ReactNode;
  /**
   * Header type.
   * @defaultValue 'basic'
   */
  headerType?: DialogHeaderType;
  /**
   * Controls whether the close button is shown.
   * @defaultValue true
   */
  showCloseButton?: boolean;
  /**
   * Controls whether the header is shown.
   * @defaultValue true
   */
  showHeader?: boolean;
  /**
   * Controls whether the variant sign is shown.
   * @defaultValue true
   */
  showVariantSign?: boolean;
  /**
   * The subheader text.
   */
  subheader?: ReactNode;
  /**
   * The variant of the dialog.
   * @defaultValue 'info'
   */
  variant?: DialogVariant;
  /**
   * Controls whether the backdrop is shown.
   * @defaultValue false
   */
  hideBackdrop?: boolean;
  /**
   * Appearance of the mask.
   * @defaultValue 'base'
   */
  maskVariant?: DialogMaskVariant;
  /**
   * Controls whether the dialog has a blur background.
   * @defaultValue false
   */
  isMaskBlur?: boolean;
  /**
   * Inline styles applied to the dialog container.
   */
  containerStyle?: CSSProperties | null;
  /**
   * Prevents the dialog from being dismissed by clicking outside.
   * @defaultValue false
   */
  preventDismiss?: boolean;
  /**
   * Custom portal container. Defaults to `document.body`.
   */
  portalContainer?: HTMLElement | null;
  /**
   * Custom container template that replaces the default header/content/footer layout.
   */
  containerSlot?: ReactNode;
  /**
   * Custom header template.
   */
  headerSlot?: ReactNode;
  /**
   * Custom content template. Takes precedence over `children`.
   */
  contentSlot?: ReactNode;
  /**
   * Custom footer template.
   */
  footerSlot?: ReactNode;
  /**
   * Custom actions template for the default footer.
   */
  footerActions?: ReactNode;
  children?: ReactNode;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<DialogSlot>;
  /**
   * Per-slot HTML attribute overrides.
   */
  slotProps?: DialogSlotProps;
  /**
   * Custom content for the close button icon. The structural owner `<button>` is preserved;
   * only the icon content inside it is replaced. This ensures the canonical
   * `button.tk-dialog-header-close-button[data-slot="close-button"]` and dismiss behavior remain intact.
   */
  renderCloseIcon?: (defaultIcon: ReactNode) => ReactNode;
  /**
   * Render override for the variant sign icon.
   */
  renderSignIcon?: (defaultNode: ReactNode) => ReactNode;
}

export interface DialogHeaderPartProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogTitlePartProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogDescriptionPartProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogContentPartProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogFooterPartProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogFooterActionsPartProps {
  children?: ReactNode;
  className?: string;
}
