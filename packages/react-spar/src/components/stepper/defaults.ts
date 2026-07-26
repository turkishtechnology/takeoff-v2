import type { StepperMode, StepperOrientation, StepperSize } from './types';

export const DEFAULT_ORIENTATION: StepperOrientation = 'horizontal';
export const DEFAULT_MODE: StepperMode = 'default';
export const DEFAULT_SIZE: StepperSize = 'base';
export const DEFAULT_ACTIVE = 0;

// Visually hidden suffixes appended to the trigger's accessible name —
// completed/error are otherwise conveyed only through aria-hidden glyphs and
// data-state styling, invisible to assistive technology. Localizable per
// stepper through the root's `completedLabel`/`errorLabel` props.
export const DEFAULT_COMPLETED_LABEL = 'completed';
export const DEFAULT_ERROR_LABEL = 'error';
