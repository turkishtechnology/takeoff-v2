import type { ElementType } from 'react';
import { TooltipArrow as SparTooltipArrow } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipArrowBase } from './base';
import type { TooltipArrowProps, TooltipArrowSlot } from './types';

export const TooltipArrow = <T extends ElementType = 'svg'>(props: TooltipArrowProps<T>) => {
  const theme = useComponentTheme('TooltipArrow');

  const { rootAttrs, rest } = composeRootAttrs<TooltipArrowProps, TooltipArrowSlot>(TooltipArrowBase, props as TooltipArrowProps<'svg'>, theme);
  const { ref, ...sparProps } = rest;

  return <SparTooltipArrow {...sparProps} {...rootAttrs} ref={ref} />;
};

TooltipArrow.displayName = 'Tooltip.Arrow';
