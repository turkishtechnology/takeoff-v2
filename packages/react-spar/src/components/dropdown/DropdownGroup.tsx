import type { ElementType } from 'react';
import { DropdownMenuGroup as SparDropdownMenuGroup } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownGroupBase } from './base';
import type { DropdownGroupProps } from './types';

export const DropdownGroup = <T extends ElementType = 'div'>(props: DropdownGroupProps<T>) => {
  const theme = useComponentTheme('DropdownGroup');

  const { rootAttrs, rest } = composeRootAttrs(DropdownGroupBase, props as DropdownGroupProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuGroup {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuGroup>
  );
};

DropdownGroup.displayName = 'Dropdown.Group';
