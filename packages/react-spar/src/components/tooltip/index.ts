import { Tooltip as TooltipRoot } from './Tooltip';
import { TooltipProvider } from './TooltipProvider';
import { TooltipTrigger } from './TooltipTrigger';
import { TooltipContent } from './TooltipContent';
import { TooltipHeader } from './TooltipHeader';
import { TooltipDescription } from './TooltipDescription';
import { TooltipArrow } from './TooltipArrow';

const Tooltip = Object.assign(TooltipRoot, {
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Header: TooltipHeader,
  Description: TooltipDescription,
  Arrow: TooltipArrow,
});

export { Tooltip };

export type {
  TooltipArrowProps,
  TooltipArrowSlot,
  TooltipContentProps,
  TooltipContentSlot,
  TooltipDescriptionProps,
  TooltipDescriptionSlot,
  TooltipHeaderProps,
  TooltipHeaderSlot,
  TooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
  TooltipTriggerSlot,
  TooltipVariant,
} from './types';
