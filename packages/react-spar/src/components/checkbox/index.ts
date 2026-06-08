import { Checkbox as CheckboxRoot } from './Checkbox';
import { CheckboxIndicator } from './CheckboxIndicator';
import { CheckboxLabel } from './CheckboxLabel';

const Checkbox = Object.assign(CheckboxRoot, {
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
});

export { Checkbox };

export type {
  CheckboxIndicatorProps,
  CheckboxIndicatorRenderProps,
  CheckboxLabelProps,
  CheckboxProps,
  CheckboxRenderProps,
  CheckboxSize,
  CheckboxSlot,
  CheckboxType,
} from './types';
