import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipDescriptionBase } from './base';
import type { TooltipDescriptionProps, TooltipDescriptionSlot } from './types';

export const TooltipDescription = (props: TooltipDescriptionProps) => {
  const theme = useComponentTheme('TooltipDescription');

  const { rootAttrs, rest } = composeRootAttrs<TooltipDescriptionProps, TooltipDescriptionSlot>(TooltipDescriptionBase, props, theme);
  const { children, ref, ...nativeProps } = rest;

  return (
    <p {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </p>
  );
};

TooltipDescription.displayName = 'Tooltip.Description';
