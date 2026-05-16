import { Popover as PopoverRoot } from './Popover';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverHeader } from './PopoverHeader';
import { PopoverDescription } from './PopoverDescription';
import { PopoverArrow } from './PopoverArrow';
import { PopoverClose } from './PopoverClose';

const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Description: PopoverDescription,
  Arrow: PopoverArrow,
  Close: PopoverClose,
});

export { Popover };

export type {
  PopoverArrowProps,
  PopoverArrowSlot,
  PopoverCloseProps,
  PopoverCloseSlot,
  PopoverContentProps,
  PopoverContentSlot,
  PopoverDescriptionProps,
  PopoverDescriptionSlot,
  PopoverHeaderProps,
  PopoverHeaderSlot,
  PopoverProps,
  PopoverTriggerProps,
  PopoverTriggerSlot,
  PopoverVariant,
} from './types';
