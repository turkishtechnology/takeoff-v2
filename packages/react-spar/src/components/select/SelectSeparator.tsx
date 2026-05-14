import type { ElementType } from 'react';
import { SelectSeparator as SparSelectSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectSeparatorBase } from './base';
import type { SelectSeparatorProps } from './types';

export const SelectSeparator = <T extends ElementType = 'div'>(props: SelectSeparatorProps<T>) => {
  const theme = useComponentTheme('SelectSeparator');

  const { rootAttrs, rest } = composeRootAttrs(SelectSeparatorBase, props as SelectSeparatorProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectSeparator {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectSeparator>
  );
};

SelectSeparator.displayName = 'Select.Separator';
