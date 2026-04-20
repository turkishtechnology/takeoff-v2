import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';

import type { ButtonSlot } from './ButtonBase';
import type { ClassNamesOverride } from '../../customization/overrides';

export type ButtonType = 'filled' | 'filledLight' | 'elevated' | 'outlined' | 'text';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'white' | 'black';

export type ButtonSize = 'large' | 'base' | 'small';

export type ButtonMode = 'button' | 'submit' | 'reset' | 'link';

export interface ButtonSlotProps {
  root?: ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>;
  label?: HTMLAttributes<HTMLSpanElement>;
  leadingIcon?: HTMLAttributes<HTMLSpanElement>;
  trailingIcon?: HTMLAttributes<HTMLSpanElement>;
  spinner?: HTMLAttributes<HTMLSpanElement>;
}

type ButtonNativeProps = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'type' | 'disabled'>;

export type ButtonProps = ButtonNativeProps & {
  /**
   * Visual type of the button.
   * @defaultValue 'filled'
   */
  type?: ButtonType;
  /**
   * Semantic color treatment.
   * @defaultValue 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Component size.
   * @defaultValue 'base'
   */
  size?: ButtonSize;
  /**
   * Rendering mode. `submit` and `reset` preserve native form semantics; `link`
   * switches the component to anchor semantics.
   * @defaultValue 'button'
   */
  mode?: ButtonMode;
  /**
   * Whether the button should stretch to its container width.
   * @defaultValue false
   */
  fullWidth?: boolean;
  /**
   * Declares that the button is intentionally rendered without a label (icon
   * only). Drives the `data-icon-only` contract and pairs with `rounded` for
   * circular icon buttons.
   * @defaultValue false
   */
  iconOnly?: boolean;
  /**
   * Makes icon-only buttons circular. Only applies when `iconOnly` is also set.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Underlines the label content.
   * @defaultValue false
   */
  underline?: boolean;
  /**
   * Loading state. When `true`, `<Button.Spinner>` becomes visible and the
   * root receives `aria-busy="true"`.
   * @defaultValue false
   */
  loading?: boolean;
  /**
   * Polymorphic tag for button or anchor rendering.
   * @defaultValue 'button'
   */
  as?: 'button' | 'a';
  /**
   * Anchor destination used when `mode="link"` or `as="a"`.
   */
  href?: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
  /**
   * Anchor target used when rendering as a link.
   */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /**
   * Anchor relationship used when rendering as a link.
   */
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  /**
   * Native disabled prop.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Compound children — must be composed from `Button.Label`,
   * `Button.LeadingIcon`, `Button.TrailingIcon`, and `Button.Spinner`.
   */
  children?: ReactNode;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<ButtonSlot>;
  /**
   * Per-slot HTML attribute overrides.
   */
  slotProps?: ButtonSlotProps;
};

export interface ButtonLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ButtonLeadingIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ButtonTrailingIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface ButtonSpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Optional custom spinner content. When omitted, a default indicator is rendered.
   */
  children?: ReactNode;
}
