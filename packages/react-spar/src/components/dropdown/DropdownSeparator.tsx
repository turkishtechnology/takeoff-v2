import type { ElementType } from 'react';
import { DropdownMenuSeparator as SparDropdownMenuSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownSeparatorBase } from './base';
import type { DropdownSeparatorProps } from './types';

export const DropdownSeparator = <T extends ElementType = 'div'>(props: DropdownSeparatorProps<T>) => {
  const theme = useComponentTheme('DropdownSeparator');

  const { rootAttrs, rest } = composeRootAttrs(DropdownSeparatorBase, props as DropdownSeparatorProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuSeparator {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuSeparator>
  );
};

DropdownSeparator.displayName = 'Dropdown.Separator';
