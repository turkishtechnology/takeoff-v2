import type { ElementType } from 'react';
import { SelectGroup as SparSelectGroup } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectGroupBase } from './base';
import type { SelectGroupProps } from './types';

export const SelectGroup = <T extends ElementType = 'div'>(props: SelectGroupProps<T>) => {
  const theme = useComponentTheme('SelectGroup');

  const { rootAttrs, rest } = composeRootAttrs(SelectGroupBase, props as SelectGroupProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectGroup {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectGroup>
  );
};

SelectGroup.displayName = 'Select.Group';
