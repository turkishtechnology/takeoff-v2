import type { ElementType } from 'react';
import { DropdownMenuViewport as SparDropdownMenuViewport } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownViewportBase } from './base';
import type { DropdownViewportProps } from './types';

export const DropdownViewport = <T extends ElementType = 'div'>(props: DropdownViewportProps<T>) => {
  const theme = useComponentTheme('DropdownViewport');

  const { rootAttrs, rest } = composeRootAttrs(DropdownViewportBase, props as DropdownViewportProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuViewport {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuViewport>
  );
};

DropdownViewport.displayName = 'Dropdown.Viewport';
