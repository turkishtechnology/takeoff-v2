import type { ElementType } from 'react';
import { DropdownMenuItem as SparDropdownMenuItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownItemBase } from './base';
import type { DropdownItemProps } from './types';

export const DropdownItem = <T extends ElementType = 'div'>(props: DropdownItemProps<T>) => {
  const theme = useComponentTheme('DropdownItem');

  const { rootAttrs, rest } = composeRootAttrs(DropdownItemBase, props as DropdownItemProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuItem {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuItem>
  );
};

DropdownItem.displayName = 'Dropdown.Item';
