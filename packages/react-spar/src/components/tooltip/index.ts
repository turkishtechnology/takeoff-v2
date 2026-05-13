import { Tooltip as TooltipRoot } from './Tooltip';
import { TooltipTrigger } from './TooltipTrigger';
import { TooltipContent } from './TooltipContent';
import { TooltipHeader } from './TooltipHeader';
import { TooltipDescription } from './TooltipDescription';
import { TooltipArrow } from './TooltipArrow';

const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Header: TooltipHeader,
  Description: TooltipDescription,
  Arrow: TooltipArrow,
});

export { Tooltip };

export type {
  TooltipAlign,
  TooltipArrowOwnProps,
  TooltipArrowProps,
  TooltipArrowSlot,
  TooltipContentOwnProps,
  TooltipContentProps,
  TooltipContentSlot,
  TooltipDescriptionOwnProps,
  TooltipDescriptionProps,
  TooltipDescriptionSlot,
  TooltipHeaderOwnProps,
  TooltipHeaderProps,
  TooltipHeaderSlot,
  TooltipProps,
  TooltipSide,
  TooltipTriggerOwnProps,
  TooltipTriggerProps,
  TooltipTriggerSlot,
  TooltipVariant,
} from './types';
