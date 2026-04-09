import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';

import type { ButtonProps } from './types';

export const buttonSlots = ['root', 'label', 'icon', 'leadingIcon', 'trailingIcon', 'spinner'] as const;

export type ButtonSlot = (typeof buttonSlots)[number];

export const buttonClassNames = {
  root: 'tk-button',
  label: 'tk-button-label',
  icon: 'tk-button-icon',
  leadingIcon: 'tk-button-leading-icon',
  trailingIcon: 'tk-button-trailing-icon',
  spinner: 'tk-button-spinner',
} as const satisfies SlotClassNames<ButtonSlot>;

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
    iconPosition: 'left',
    rounded: false,
    underline: false,
    loading: false,
    as: 'button',
    disabled: false,
  },
});

/**
 * @deprecated Use `ButtonBase.styles` instead.
 */
export const buttonStyles = ButtonBase.styles;
