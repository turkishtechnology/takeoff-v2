import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipDescriptionBase } from './base';
import type { TooltipDescriptionProps, TooltipDescriptionSlot } from './types';

export const TooltipDescription = <T extends ElementType = 'p'>(props: TooltipDescriptionProps<T>) => {
  const theme = useComponentTheme('TooltipDescription');

  const { rootAttrs, rest } = composeRootAttrs<TooltipDescriptionProps, TooltipDescriptionSlot>(TooltipDescriptionBase, props as TooltipDescriptionProps<'p'>, theme);
  const { children, ref, ...nativeProps } = rest;

  return (
    <p {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </p>
  );
};

TooltipDescription.displayName = 'Tooltip.Description';
