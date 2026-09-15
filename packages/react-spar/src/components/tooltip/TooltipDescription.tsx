import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipDescriptionBase } from './base';
import type { TooltipDescriptionProps, TooltipDescriptionSlot } from './types';

export const TooltipDescription = <T extends ElementType = 'p'>(props: TooltipDescriptionProps<T>) => {
  const theme = useComponentTheme('TooltipDescription');

  const { rootAttrs, rest } = composeRootAttrs<TooltipDescriptionProps, TooltipDescriptionSlot>(TooltipDescriptionBase, props as TooltipDescriptionProps<'p'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

TooltipDescription.displayName = 'Tooltip.Description';
