import { Popover as PopoverRoot } from './Popover';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverArrow } from './PopoverArrow';
import { PopoverClose } from './PopoverClose';

const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
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
  PopoverProps,
  PopoverTriggerProps,
  PopoverTriggerSlot,
  PopoverVariant,
} from './types';
