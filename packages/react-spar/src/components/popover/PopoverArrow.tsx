import type { ElementType } from 'react';
import { PopoverArrow as SparPopoverArrow } from '@turkish-technology/spar';

import { composeRootAttrs, renderPointerArrow } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverArrowBase } from './base';
import type { PopoverArrowProps, PopoverArrowSlot } from './types';

export const PopoverArrow = <T extends ElementType = 'svg'>(props: PopoverArrowProps<T>) => {
  const theme = useComponentTheme('PopoverArrow');

  const { rootAttrs, rest } = composeRootAttrs<PopoverArrowProps, PopoverArrowSlot>(PopoverArrowBase, props as PopoverArrowProps<'svg'>, theme);
  const { ref, children, ...sparProps } = rest;

  // Default to the shared bordered pointer shape (border rim on the outer edges,
  // open where it joins the bubble); an explicit `children` still wins.
  return (
    <SparPopoverArrow {...sparProps} {...rootAttrs} ref={ref}>
      {children ?? renderPointerArrow()}
    </SparPopoverArrow>
  );
};

PopoverArrow.displayName = 'Popover.Arrow';
