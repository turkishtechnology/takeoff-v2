import { Radio as RadioRoot } from './Radio';
import { RadioDescription } from './RadioDescription';
import { RadioIndicator } from './RadioIndicator';
import { RadioItem } from './RadioItem';
import { RadioLabel } from './RadioLabel';
import { RadioText } from './RadioText';

const Radio = Object.assign(RadioRoot, {
  Item: RadioItem,
  Indicator: RadioIndicator,
  Text: RadioText,
  Label: RadioLabel,
  Description: RadioDescription,
});

export { Radio };

export type {
  RadioDescriptionProps,
  RadioIndicatorProps,
  RadioItemProps,
  RadioItemSlot,
  RadioLabelProps,
  RadioPosition,
  RadioProps,
  RadioRenderProps,
  RadioSize,
  RadioSlot,
  RadioTextProps,
  RadioType,
} from './types';
