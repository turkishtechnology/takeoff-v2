import type { ElementType } from 'react';
import { TooltipContent as SparTooltipContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TooltipContentBase } from './base';
import { DEFAULT_VARIANT } from './defaults';
import type { TooltipContentProps, TooltipContentSlot } from './types';

export const TooltipContent = <T extends ElementType = 'div'>(props: TooltipContentProps<T>) => {
  const theme = useComponentTheme('TooltipContent');

  const { variant = DEFAULT_VARIANT, className, classNames, slotProps, children, ref, ...sparProps } = props as TooltipContentProps<'div'>;

  const { rootAttrs } = composeRootAttrs<TooltipContentProps, TooltipContentSlot>(TooltipContentBase, { className, classNames, slotProps }, theme, {
    stateAttrs: {
      'data-variant': variant,
    },
  });

  return (
    <SparTooltipContent {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTooltipContent>
  );
};

TooltipContent.displayName = 'Tooltip.Content';
