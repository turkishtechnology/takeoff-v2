import { Checkbox as CheckboxRoot } from './Checkbox';
import { CheckboxIcon } from './CheckboxIcon';
import { CheckboxIndicator } from './CheckboxIndicator';

const Checkbox = Object.assign(CheckboxRoot, {
  Indicator: CheckboxIndicator,
  Icon: CheckboxIcon,
});

export { Checkbox };

export type { CheckboxIconProps, CheckboxIconRenderProps, CheckboxIndicatorProps, CheckboxProps, CheckboxRenderProps, CheckboxSize, CheckboxSlot, CheckboxType } from './types';
