import type { ElementType } from 'react';
import { SelectValue as SparSelectValue } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectValueBase } from './base';
import type { SelectValueProps } from './types';

export const SelectValue = <T extends ElementType = 'span'>(props: SelectValueProps<T>) => {
  const theme = useComponentTheme('SelectValue');

  const { rootAttrs, rest } = composeRootAttrs(SelectValueBase, props as SelectValueProps<'span'>, theme);

  const { placeholder, children, ref, ...spar } = rest;

  return (
    <SparSelectValue {...spar} placeholder={placeholder} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectValue>
  );
};

SelectValue.displayName = 'Select.Value';
