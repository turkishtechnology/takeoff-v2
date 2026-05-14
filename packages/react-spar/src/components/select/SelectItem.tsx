import type { ElementType } from 'react';
import { SelectItem as SparSelectItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectItemBase } from './base';
import type { SelectItemProps } from './types';

export const SelectItem = <T extends ElementType = 'div'>(props: SelectItemProps<T>) => {
  const theme = useComponentTheme('SelectItem');

  const { rootAttrs, rest } = composeRootAttrs(SelectItemBase, props as SelectItemProps<'div'>, theme);

  const { value, disabled, textValue, children, ref, ...spar } = rest;

  return (
    <SparSelectItem {...spar} value={value} disabled={disabled} textValue={textValue} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectItem>
  );
};

SelectItem.displayName = 'Select.Item';
