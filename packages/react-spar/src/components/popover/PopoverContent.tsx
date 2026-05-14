import type { ElementType } from 'react';
import { PopoverContent as SparPopoverContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverContentBase } from './base';
import { DEFAULT_VARIANT } from './defaults';
import type { PopoverContentProps, PopoverContentSlot } from './types';

export const PopoverContent = <T extends ElementType = 'div'>(props: PopoverContentProps<T>) => {
  const theme = useComponentTheme('PopoverContent');

  const { rootAttrs, rest } = composeRootAttrs<PopoverContentProps, PopoverContentSlot>(PopoverContentBase, props as PopoverContentProps<'div'>, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT }) => ({
      'data-variant': variant,
    }),
  });
  const { variant: _variant, children, ref, ...sparProps } = rest;

  return (
    <SparPopoverContent {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparPopoverContent>
  );
};

PopoverContent.displayName = 'Popover.Content';
