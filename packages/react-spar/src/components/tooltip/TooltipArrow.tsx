import type { ElementType } from 'react';
import { TooltipArrow as SparTooltipArrow } from '@turkish-technology/spar';

import { composeRootAttrs, renderPointerArrow } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipArrowBase } from './base';
import type { TooltipArrowProps, TooltipArrowSlot } from './types';

export const TooltipArrow = <T extends ElementType = 'svg'>(props: TooltipArrowProps<T>) => {
  const theme = useComponentTheme('TooltipArrow');

  const { rootAttrs, rest } = composeRootAttrs<TooltipArrowProps, TooltipArrowSlot>(TooltipArrowBase, props as TooltipArrowProps<'svg'>, theme);
  const { ref, children, ...sparProps } = rest;

  // Default to the shared bordered pointer shape (border rim on the outer edges,
  // open where it joins the bubble); an explicit `children` still wins.
  return (
    <SparTooltipArrow {...sparProps} {...rootAttrs} ref={ref}>
      {children ?? renderPointerArrow()}
    </SparTooltipArrow>
  );
};

TooltipArrow.displayName = 'Tooltip.Arrow';
