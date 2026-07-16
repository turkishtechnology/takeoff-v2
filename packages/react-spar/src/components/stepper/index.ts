import { Stepper as StepperRoot } from './Stepper';
import { StepperTitle } from './StepperTitle';
import { StepperItem } from './StepperItem';
import { StepperDescription } from './StepperDescription';

const Stepper = Object.assign(StepperRoot, {
  Item: StepperItem,
  Title: StepperTitle,
  Description: StepperDescription,
});

export { Stepper };

export type {
  StepperTitleProps,
  StepperIndicatorState,
  StepperItemProps,
  StepperMode,
  StepperOrientation,
  StepperProps,
  StepperSize,
  StepperStepClickDetail,
  StepperStepStatus,
  StepperDescriptionProps,
} from './types';
