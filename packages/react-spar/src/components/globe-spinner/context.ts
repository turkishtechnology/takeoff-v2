import { createSafeContext } from '../../hooks';

export interface GlobeSpinnerContextValue {
  /** Id of the arc path `GlobeSpinner.Label` attaches its `<textPath>` to. */
  labelPathId: string;
}

export const [GlobeSpinnerProvider, useGlobeSpinnerContext] = createSafeContext<GlobeSpinnerContextValue>('GlobeSpinner');
