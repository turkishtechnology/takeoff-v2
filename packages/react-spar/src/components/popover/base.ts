import { createComponentBase } from '../../core';

import type {
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
  PopoverTriggerProps,
  PopoverTriggerSlot,
} from './types';

// @archetype inherited — wraps SparPopover.Trigger
export const PopoverTriggerBase = createComponentBase<PopoverTriggerProps, PopoverTriggerSlot>({
  name: 'PopoverTrigger',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-trigger',
  },
});

// @archetype inherited — wraps SparPopover.Content
export const PopoverContentBase = createComponentBase<PopoverContentProps, PopoverContentSlot>({
  name: 'PopoverContent',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-content',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const PopoverHeaderBase = createComponentBase<PopoverHeaderProps, PopoverHeaderSlot>({
  name: 'PopoverHeader',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-header',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const PopoverDescriptionBase = createComponentBase<PopoverDescriptionProps, PopoverDescriptionSlot>({
  name: 'PopoverDescription',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-description',
  },
});

// @archetype inherited — wraps SparPopover.Arrow
export const PopoverArrowBase = createComponentBase<PopoverArrowProps, PopoverArrowSlot>({
  name: 'PopoverArrow',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-arrow',
  },
});

// @archetype inherited — wraps SparPopover.Close
export const PopoverCloseBase = createComponentBase<PopoverCloseProps, PopoverCloseSlot>({
  name: 'PopoverClose',
  slots: ['root'] as const,
  classes: {
    root: 'tk-popover-close',
  },
});
