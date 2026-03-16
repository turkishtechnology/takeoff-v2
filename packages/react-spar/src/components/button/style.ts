import type { SlotClassNames } from '../../types';

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

/**
 * @deprecated Use `buttonClassNames` instead.
 */
export const buttonStyles = buttonClassNames;
