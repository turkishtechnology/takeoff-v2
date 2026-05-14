import type { ElementType } from 'react';
import { TooltipContent as SparTooltipContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipContentBase } from './base';
import { DEFAULT_VARIANT } from './defaults';
import type { TooltipContentProps, TooltipContentSlot } from './types';

export const TooltipContent = <T extends ElementType = 'div'>(props: TooltipContentProps<T>) => {
  const theme = useComponentTheme('TooltipContent');

  const { rootAttrs, rest } = composeRootAttrs<TooltipContentProps, TooltipContentSlot>(TooltipContentBase, props as TooltipContentProps<'div'>, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT }) => ({
      'data-variant': variant,
    }),
  });

  const { variant: _variant, children, ref, ...sparProps } = rest;

  return (
    <SparTooltipContent {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTooltipContent>
  );
};

TooltipContent.displayName = 'Tooltip.Content';
