import { TimePicker as TimePickerRoot } from './TimePicker';
import { TimePickerBody } from './TimePickerBody';
import { TimePickerFooter } from './TimePickerFooter';
import { TimePickerHeader } from './TimePickerHeader';
import { TimePickerMeridiem } from './TimePickerMeridiem';

const TimePicker = Object.assign(TimePickerRoot, {
  Header: TimePickerHeader,
  Body: TimePickerBody,
  Meridiem: TimePickerMeridiem,
  Footer: TimePickerFooter,
});

export { TimePicker };

export type {
  TimePickerBodyProps,
  TimePickerBodySlot,
  TimePickerFooterProps,
  TimePickerFooterSlot,
  TimePickerFormat,
  TimePickerHeaderProps,
  TimePickerHeaderSlot,
  TimePickerLabels,
  TimePickerMeridiemPlacement,
  TimePickerMeridiemProps,
  TimePickerMeridiemSlot,
  TimePickerMode,
  TimePickerProps,
  TimePickerSize,
  TimePickerSlot,
  TimePickerType,
  TimePickerUnit,
} from './types';
