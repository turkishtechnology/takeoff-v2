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
   * Fired when the dialog opens.
   */
  onOpen?: () => void;
  /**
   * Fired when the dialog closes or requests to close.
   */
  onClose?: () => void;
  /**
   * Header type.
   * @defaultValue 'basic'
   */
  headerType?: DialogHeaderType;
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
   * Compound children — typically composed from `Dialog.Mask`, `Dialog.Panel`
   * (containing `Dialog.Header`, `Dialog.Body`, `Dialog.Footer`).
   */
  children?: ReactNode;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<DialogSlot>;
  /**
   * Per-slot HTML attribute overrides.
   */
  slotProps?: DialogSlotProps;
}

export type DialogMaskProps = HTMLAttributes<HTMLDivElement>;

export interface DialogPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DialogTitleGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DialogTitleProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface DialogSignIconProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Optional custom sign icon content. When omitted, the variant-driven
   * placeholder icon is rendered.
   */
  children?: ReactNode;
}

export interface DialogCloseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> {
  /**
   * Optional custom icon content. When omitted the default close icon is
   * rendered.
   */
  children?: ReactNode;
}

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface DialogFooterActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
