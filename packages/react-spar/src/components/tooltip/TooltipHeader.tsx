import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipHeaderBase } from './base';
import type { TooltipHeaderProps, TooltipHeaderSlot } from './types';

export const TooltipHeader = <T extends ElementType = 'div'>(props: TooltipHeaderProps<T>) => {
  const theme = useComponentTheme('TooltipHeader');

  const { rootAttrs, rest } = composeRootAttrs<TooltipHeaderProps, TooltipHeaderSlot>(TooltipHeaderBase, props as TooltipHeaderProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

TooltipHeader.displayName = 'Tooltip.Header';
