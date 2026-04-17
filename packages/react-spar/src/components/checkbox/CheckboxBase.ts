import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';

import type { CheckboxProps } from './types';

export const checkboxSlots = ['root', 'indicator', 'icon', 'text', 'label', 'description'] as const;

export type CheckboxSlot = (typeof checkboxSlots)[number];

export const checkboxClassNames = {
  root: 'tk-checkbox',
  indicator: 'tk-checkbox-indicator',
  icon: 'tk-checkbox-icon',
  text: 'tk-checkbox-text',
  label: 'tk-checkbox-label',
  description: 'tk-checkbox-description',
} as const satisfies SlotClassNames<CheckboxSlot>;

export const CheckboxBase = createComponentBase<CheckboxProps, CheckboxSlot>({
  name: 'Checkbox',
  slots: checkboxSlots,
  classNames: checkboxClassNames,
  defaultProps: {
    type: 'default',
    size: 'base',
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    indeterminate: false,
  },
});
