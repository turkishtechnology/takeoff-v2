import type { ElementType } from 'react';
import { SelectLabel as SparSelectLabel } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectLabelBase } from './base';
import type { SelectLabelProps } from './types';

export const SelectLabel = <T extends ElementType = 'label'>(props: SelectLabelProps<T>) => {
  const theme = useComponentTheme('SelectLabel');

  const { rootAttrs, rest } = composeRootAttrs(SelectLabelBase, props as SelectLabelProps<'label'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectLabel {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectLabel>
  );
};

SelectLabel.displayName = 'Select.Label';
