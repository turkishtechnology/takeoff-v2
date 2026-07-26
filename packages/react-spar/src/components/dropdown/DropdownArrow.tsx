import type { ElementType } from 'react';
import { DropdownMenuArrow as SparDropdownMenuArrow } from '@turkish-technology/spar';

import { composeRootAttrs, renderPointerArrow } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownArrowBase } from './base';
import type { DropdownArrowProps } from './types';

export const DropdownArrow = <T extends ElementType = 'svg'>(props: DropdownArrowProps<T>) => {
  const theme = useComponentTheme('DropdownArrow');

  const { rootAttrs, rest } = composeRootAttrs(DropdownArrowBase, props as DropdownArrowProps<'svg'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuArrow {...sparProps} {...rootAttrs} ref={ref}>
      {children ?? renderPointerArrow()}
    </SparDropdownMenuArrow>
  );
};

DropdownArrow.displayName = 'Dropdown.Arrow';
