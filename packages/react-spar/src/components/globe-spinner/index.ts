import { GlobeSpinner as GlobeSpinnerRoot } from './GlobeSpinner';
import { GlobeSpinnerLabel } from './GlobeSpinnerLabel';

const GlobeSpinner = Object.assign(GlobeSpinnerRoot, {
  Label: GlobeSpinnerLabel,
});

export { GlobeSpinner };

export type { GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot, GlobeSpinnerProps, GlobeSpinnerSize, GlobeSpinnerSlot, GlobeSpinnerVariant } from './types';
