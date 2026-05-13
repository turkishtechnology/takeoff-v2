import { createComponentBase } from '../../core';

import type {
  TooltipArrowProps,
  TooltipArrowSlot,
  TooltipContentProps,
  TooltipContentSlot,
  TooltipDescriptionProps,
  TooltipDescriptionSlot,
  TooltipHeaderProps,
  TooltipHeaderSlot,
  TooltipTriggerProps,
  TooltipTriggerSlot,
} from './types';

// @archetype inherited — wraps SparTooltip.Trigger
export const TooltipTriggerBase = createComponentBase<TooltipTriggerProps, TooltipTriggerSlot>({
  name: 'TooltipTrigger',
  slots: ['root'] as const,
  classes: {
    root: 'tk-tooltip-trigger',
  },
});

// @archetype inherited — wraps SparTooltip.Content
export const TooltipContentBase = createComponentBase<TooltipContentProps, TooltipContentSlot>({
  name: 'TooltipContent',
  slots: ['root'] as const,
  classes: {
    root: 'tk-tooltip-content',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const TooltipHeaderBase = createComponentBase<TooltipHeaderProps, TooltipHeaderSlot>({
  name: 'TooltipHeader',
  slots: ['root'] as const,
  classes: {
    root: 'tk-tooltip-header',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const TooltipDescriptionBase = createComponentBase<TooltipDescriptionProps, TooltipDescriptionSlot>({
  name: 'TooltipDescription',
  slots: ['root'] as const,
  classes: {
    root: 'tk-tooltip-description',
  },
});

// @archetype inherited — wraps SparTooltip.Arrow
export const TooltipArrowBase = createComponentBase<TooltipArrowProps, TooltipArrowSlot>({
  name: 'TooltipArrow',
  slots: ['root'] as const,
  classes: {
    root: 'tk-tooltip-arrow',
  },
});
