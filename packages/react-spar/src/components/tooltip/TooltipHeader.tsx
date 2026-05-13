import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipHeaderBase } from './base';
import type { TooltipHeaderProps, TooltipHeaderSlot } from './types';

export const TooltipHeader = (props: TooltipHeaderProps) => {
  const theme = useComponentTheme('TooltipHeader');

  const { rootAttrs, rest } = composeRootAttrs<TooltipHeaderProps, TooltipHeaderSlot>(TooltipHeaderBase, props, theme);
  const { children, ref, ...nativeProps } = rest;

  return (
    <div {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </div>
  );
};

TooltipHeader.displayName = 'Tooltip.Header';
