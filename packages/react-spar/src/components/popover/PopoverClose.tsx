import type { ElementType } from 'react';
import { PopoverClose as SparPopoverClose } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverCloseBase } from './base';
import type { PopoverCloseProps, PopoverCloseSlot } from './types';

export const PopoverClose = <T extends ElementType = 'button'>(props: PopoverCloseProps<T>) => {
  const theme = useComponentTheme('PopoverClose');

  const { rootAttrs, rest } = composeRootAttrs<PopoverCloseProps, PopoverCloseSlot>(PopoverCloseBase, props as PopoverCloseProps<'button'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparPopoverClose {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparPopoverClose>
  );
};

PopoverClose.displayName = 'Popover.Close';
