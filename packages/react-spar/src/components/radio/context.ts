import { createSafeContext } from '../../hooks';

import type { RadioPosition, RadioSize, RadioType } from './types';

export interface RadioGroupContextValue {
  size: RadioSize;
  type: RadioType;
  invalid: boolean;
  position: RadioPosition;
}

export const [RadioGroupProvider, useRadioGroupOwnContext] = createSafeContext<RadioGroupContextValue>('RadioGroupProvider');

// RadioItemProvider exists only to enforce the boundary between `Radio.Item`
// and its sub-components (`Radio.Indicator`, `Radio.Text`, `Radio.Label`,
// `Radio.Description`). It carries no data — each sub-component owns its own
// base + theme. Using a sentinel value keeps the safe-context type non-null.
interface RadioItemContextValue {
  readonly inside: true;
}

const RADIO_ITEM_CONTEXT_VALUE: RadioItemContextValue = { inside: true };

export const [RadioItemProvider, useRadioItemOwnContext] = createSafeContext<RadioItemContextValue>('RadioItemProvider');

export { RADIO_ITEM_CONTEXT_VALUE };
