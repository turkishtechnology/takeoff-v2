import type { ElementType } from 'react';
import { Select as SparSelect, type SelectProps as SparSelectProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectBase } from './base';
import { SelectProvider } from './context';
import { DEFAULT_SIZE } from './defaults';
import type { SelectProps } from './types';

export const Select = <T extends ElementType = 'div'>(props: SelectProps<T>) => {
  const theme = useComponentTheme('Select');

  // `data-disabled` is intentionally NOT re-emitted — Spar's Select root sets
  // it. `data-size` and `data-invalid` are takeoff-v2's own visual vocabulary,
  // so they live here and cascade to the Trigger via context.
  const { rootAttrs, rest } = composeRootAttrs(SelectBase, props as SelectProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, isInvalid }) => ({
      'data-size': size,
      'data-invalid': isInvalid ? '' : undefined,
    }),
  });

  const { size = DEFAULT_SIZE, isInvalid = false, children, ref, ...sparProps } = rest;

  return (
    <SelectProvider value={{ size, isInvalid }}>
      <SparSelect {...(sparProps as unknown as SparSelectProps)} ref={ref} {...rootAttrs}>
        {children}
      </SparSelect>
    </SelectProvider>
  );
};

Select.displayName = 'Select';
