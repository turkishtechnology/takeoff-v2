import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';

import type { ButtonSlot } from './ButtonBase';
import type { ClassNamesOverride } from '../../customization/overrides';

export type ButtonType = 'filled' | 'filledLight' | 'elevated' | 'outlined' | 'text';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'white' | 'black';

export type ButtonSize = 'large' | 'base' | 'small';

export type ButtonMode = 'button' | 'submit' | 'reset' | 'link';

export type ButtonIconPosition = 'left' | 'right';

export type ButtonIcon = ReactNode | string;

export interface ButtonSlotProps {
  root?: ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>;
  label?: HTMLAttributes<HTMLSpanElement>;
  icon?: HTMLAttributes<HTMLSpanElement>;
  leadingIcon?: HTMLAttributes<HTMLSpanElement>;
  trailingIcon?: HTMLAttributes<HTMLSpanElement>;
  spinner?: HTMLAttributes<HTMLSpanElement>;
}

type ButtonNativeProps = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'type' | 'disabled'>;

export type ButtonProps = ButtonNativeProps & {
  /**
   * Visual type of the button. This matches the Takeoff UI button `type` prop.
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
   * Rendering mode. `submit` and `reset` preserve native form semantics; `link` switches the component to anchor semantics.
   * @defaultValue 'button'
   */
  mode?: ButtonMode;
  /**
   * Whether the button should stretch to its container width.
   * @defaultValue false
   */
  fullWidth?: boolean;
  /**
   * Shared icon prop for parity with the web component contract.
   * Prefer `leadingIcon` and `trailingIcon` when you need explicit slot control.
   * String values assume the consumer has loaded Material Symbols fonts.
   */
  icon?: ButtonIcon;
  /**
   * Placement of the shared `icon` prop.
   * @defaultValue 'left'
   */
  iconPosition?: ButtonIconPosition;
  /**
   * Explicit content for the leading icon slot.
   */
  leadingIcon?: ReactNode;
  /**
   * Explicit content for the trailing icon slot.
   */
  trailingIcon?: ReactNode;
  /**
   * Makes icon-only buttons circular.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Underlines the label content.
   * @defaultValue false
   */
  underline?: boolean;
  /**
   * Optional content alias for web component parity.
   * `children` takes precedence when both are provided.
   */
  label?: ReactNode;
  /**
   * Loading state.
   * @defaultValue false
   */
  loading?: boolean;
  /**
   * Optional custom loading indicator.
   */
  spinner?: ReactNode;
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
   * Native disabled prop passed through to Spar or mapped to anchor disabled semantics.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Button label or custom content.
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
  /**
   * Render override for the icon slot. Receives the default icon node and returns custom content.
   */
  renderIcon?: (defaultIcon: ReactNode) => ReactNode;
  /**
   * Render override for the spinner slot. Receives the default spinner node and returns custom content.
   */
  renderSpinner?: (defaultSpinner: ReactNode) => ReactNode;
};
