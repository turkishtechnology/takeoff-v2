import type { ElementType } from 'react';
import { PopoverTrigger as SparPopoverTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverTriggerBase } from './base';
import type { PopoverTriggerProps, PopoverTriggerSlot } from './types';

export const PopoverTrigger = <T extends ElementType = 'button'>(props: PopoverTriggerProps<T>) => {
  const theme = useComponentTheme('PopoverTrigger');

  const { rootAttrs, rest } = composeRootAttrs<PopoverTriggerProps, PopoverTriggerSlot>(PopoverTriggerBase, props as PopoverTriggerProps<'button'>, theme);
  const { children, ref, ...sparProps } = rest as PopoverTriggerProps<'button'>;

  return (
    <SparPopoverTrigger {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparPopoverTrigger>
  );
};

PopoverTrigger.displayName = 'Popover.Trigger';
