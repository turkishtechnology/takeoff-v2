import { Checkbox as CheckboxRoot } from './Checkbox';
import { CheckboxDescription } from './CheckboxDescription';
import { CheckboxIcon } from './CheckboxIcon';
import { CheckboxIndicator } from './CheckboxIndicator';
import { CheckboxLabel } from './CheckboxLabel';

const Checkbox = Object.assign(CheckboxRoot, {
  Indicator: CheckboxIndicator,
  Icon: CheckboxIcon,
  Label: CheckboxLabel,
  Description: CheckboxDescription,
});

export { Checkbox };

export type {
  CheckboxDescriptionProps,
  CheckboxIconProps,
  CheckboxIconRenderProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxProps,
  CheckboxRenderProps,
  CheckboxSize,
  CheckboxSlot,
  CheckboxType,
} from './types';
