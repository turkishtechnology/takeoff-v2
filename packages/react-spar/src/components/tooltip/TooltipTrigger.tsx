import { TooltipTrigger as SparTooltipTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipTriggerBase } from './base';
import type { TooltipTriggerProps, TooltipTriggerSlot } from './types';

export const TooltipTrigger = (props: TooltipTriggerProps) => {
  const theme = useComponentTheme('TooltipTrigger');

  const { rootAttrs, rest } = composeRootAttrs<TooltipTriggerProps, TooltipTriggerSlot>(TooltipTriggerBase, props, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparTooltipTrigger {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTooltipTrigger>
  );
};

TooltipTrigger.displayName = 'Tooltip.Trigger';
