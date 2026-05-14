import type { ElementType } from 'react';
import { PopoverArrow as SparPopoverArrow } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverArrowBase } from './base';
import type { PopoverArrowProps, PopoverArrowSlot } from './types';

export const PopoverArrow = <T extends ElementType = 'svg'>(props: PopoverArrowProps<T>) => {
  const theme = useComponentTheme('PopoverArrow');

  const { rootAttrs, rest } = composeRootAttrs<PopoverArrowProps, PopoverArrowSlot>(PopoverArrowBase, props as PopoverArrowProps<'svg'>, theme);
  const { ref, ...sparProps } = rest;

  return <SparPopoverArrow {...sparProps} {...rootAttrs} ref={ref} />;
};

PopoverArrow.displayName = 'Popover.Arrow';
