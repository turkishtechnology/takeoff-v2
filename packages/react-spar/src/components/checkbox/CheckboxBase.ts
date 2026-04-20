import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

import type { CheckboxProps } from './types';

export const checkboxSlots = ['root', 'indicator', 'icon', 'content', 'label', 'description'] as const;

export type CheckboxSlot = (typeof checkboxSlots)[number];

export const checkboxClassNames = {
  root: 'tk-checkbox',
  indicator: 'tk-checkbox-indicator',
  icon: 'tk-checkbox-icon',
  content: 'tk-checkbox-content',
  label: 'tk-checkbox-label',
  description: 'tk-checkbox-description',
} as const satisfies SlotClassNames<CheckboxSlot>;

/**
 * Composition archetype classification (see
 * `packages/react-spar/docs/CODING_STANDARDS.md § Composition Archetypes`).
 *
 * `SparCheckbox` is a leaf upstream with no compound parts, so every exported
 * sub-component here is a React enhancement.
 *
 * - `Checkbox` root       — inherited. Delegates to `SparCheckbox`.
 * - `Checkbox.Indicator`  — react-enhancement.
 * - `Checkbox.Icon`       — react-enhancement; function-as-children exposes
 *   `{ checked, indeterminate }` for consumer-rendered glyphs.
 * - `Checkbox.Content`    — react-enhancement.
 * - `Checkbox.Label`      — react-enhancement.
 * - `Checkbox.Description`— react-enhancement.
 */
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

export interface CheckboxContextValue {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  classNames: CheckboxProps['classNames'];
  slotProps: CheckboxProps['slotProps'];
}

export const [CheckboxProvider, useCheckboxContext] = createSafeContext<CheckboxContextValue>('Checkbox');
