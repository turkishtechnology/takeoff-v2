import type { ElementType } from 'react';
import { DropdownMenuTrigger as SparDropdownMenuTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownTriggerBase } from './base';
import { useDropdownOwnContext } from './context';
import type { DropdownTriggerProps } from './types';

export const DropdownTrigger = <T extends ElementType = 'button'>(props: DropdownTriggerProps<T>) => {
  const theme = useComponentTheme('DropdownTrigger');
  const { size } = useDropdownOwnContext('Dropdown.Trigger');

  const { rootAttrs, rest } = composeRootAttrs(DropdownTriggerBase, props as DropdownTriggerProps<'button'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDropdownMenuTrigger {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDropdownMenuTrigger>
  );
};

DropdownTrigger.displayName = 'Dropdown.Trigger';
