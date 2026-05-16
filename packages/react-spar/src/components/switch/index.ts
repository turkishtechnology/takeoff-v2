import { Switch as SwitchRoot } from './Switch';
import { SwitchIndicator } from './SwitchIndicator';

const Switch = Object.assign(SwitchRoot, {
  Indicator: SwitchIndicator,
});

export { Switch };

export type {
  SwitchIndicatorProps,
  SwitchIndicatorRenderProps,
  SwitchProps,
  SwitchRenderProps,
  SwitchSize,
  SwitchSlot,
  SwitchVariant,
} from './types';
