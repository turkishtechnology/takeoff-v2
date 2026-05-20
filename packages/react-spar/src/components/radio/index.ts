import { Radio as RadioRoot } from './Radio';
import { RadioIndicator } from './RadioIndicator';
import { RadioItem } from './RadioItem';
import { RadioLabel } from './RadioLabel';

const Radio = Object.assign(RadioRoot, {
  Item: RadioItem,
  Indicator: RadioIndicator,
  Label: RadioLabel,
});

export { Radio };

export type { RadioIndicatorProps, RadioItemProps, RadioItemSlot, RadioLabelProps, RadioPosition, RadioProps, RadioRenderProps, RadioSize, RadioSlot, RadioType } from './types';
