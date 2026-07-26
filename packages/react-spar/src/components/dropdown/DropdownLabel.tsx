import type { ElementType } from 'react';
import { DropdownMenuLabel as SparDropdownMenuLabel } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownLabelBase } from './base';
import type { DropdownLabelProps } from './types';

export const DropdownLabel = <T extends ElementType = 'div'>(props: DropdownLabelProps<T>) => {
  const theme = useComponentTheme('DropdownLabel');

  const { rootAttrs, rest } = composeRootAttrs(DropdownLabelBase, props as DropdownLabelProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuLabel {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuLabel>
  );
};

DropdownLabel.displayName = 'Dropdown.Label';
