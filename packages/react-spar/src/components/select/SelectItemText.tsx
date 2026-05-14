import type { ElementType } from 'react';
import { SelectItemText as SparSelectItemText } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectItemTextBase } from './base';
import type { SelectItemTextProps } from './types';

export const SelectItemText = <T extends ElementType = 'span'>(props: SelectItemTextProps<T>) => {
  const theme = useComponentTheme('SelectItemText');

  const { rootAttrs, rest } = composeRootAttrs(SelectItemTextBase, props as SelectItemTextProps<'span'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectItemText {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectItemText>
  );
};

SelectItemText.displayName = 'Select.ItemText';
