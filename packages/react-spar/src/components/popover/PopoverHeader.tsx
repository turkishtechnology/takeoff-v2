import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverHeaderBase } from './base';
import type { PopoverHeaderProps, PopoverHeaderSlot } from './types';

export const PopoverHeader = <T extends ElementType = 'div'>(props: PopoverHeaderProps<T>) => {
  const theme = useComponentTheme('PopoverHeader');

  const { rootAttrs, rest } = composeRootAttrs<PopoverHeaderProps, PopoverHeaderSlot>(PopoverHeaderBase, props as PopoverHeaderProps<'div'>, theme);
  const { children, ref, ...nativeProps } = rest;

  return (
    <div {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </div>
  );
};

PopoverHeader.displayName = 'Popover.Header';
