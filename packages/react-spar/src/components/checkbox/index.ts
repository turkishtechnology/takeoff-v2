import { Checkbox as CheckboxRoot } from './Checkbox';
import { CheckboxIndicator } from './CheckboxIndicator';

const Checkbox = Object.assign(CheckboxRoot, {
  Indicator: CheckboxIndicator,
});

export { Checkbox };

export type {
  CheckboxIndicatorProps,
  CheckboxIndicatorRenderProps,
  CheckboxProps,
  CheckboxRenderProps,
  CheckboxSize,
  CheckboxSlot,
} from './types';
