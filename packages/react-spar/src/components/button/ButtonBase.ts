import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

import type { ButtonProps } from './types';

export const buttonSlots = ['root', 'label', 'leadingIcon', 'trailingIcon', 'spinner'] as const;

export type ButtonSlot = (typeof buttonSlots)[number];

export const buttonClassNames = {
  root: 'tk-button',
  label: 'tk-button-label',
  leadingIcon: 'tk-button-leading-icon',
  trailingIcon: 'tk-button-trailing-icon',
  spinner: 'tk-button-spinner',
} as const satisfies SlotClassNames<ButtonSlot>;

/**
 * Class fragment applied alongside the directional icon class so that shared
 * icon styling rules (padding, size, alignment) remain a single selector
 * target. Not surfaced as a slot key because no slot node owns it alone.
 */
export const buttonIconSharedClassName = 'tk-button-icon';

export const ButtonBase = createComponentBase<ButtonProps, ButtonSlot>({
  name: 'Button',
  slots: buttonSlots,
  classNames: buttonClassNames,
  defaultProps: {
    type: 'filled',
    variant: 'primary',
    size: 'base',
    mode: 'button',
    fullWidth: false,
    rounded: false,
    underline: false,
    loading: false,
    iconOnly: false,
    as: 'button',
    disabled: false,
  },
});

export interface ButtonContextValue {
  loading: boolean;
  disabled: boolean;
  size: NonNullable<ButtonProps['size']>;
  variant: NonNullable<ButtonProps['variant']>;
  type: NonNullable<ButtonProps['type']>;
  mode: NonNullable<ButtonProps['mode']>;
  classNames: ButtonProps['classNames'];
  slotProps: ButtonProps['slotProps'];
}

export const [ButtonProvider, useButtonContext] = createSafeContext<ButtonContextValue>('Button');
