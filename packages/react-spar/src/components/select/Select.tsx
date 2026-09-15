import type { ElementType } from 'react';
import { Select as SparSelect, type SelectProps as SparSelectProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectBase } from './base';
import { SelectProvider } from './context';
import { DEFAULT_CONTENT_WIDTH, DEFAULT_SIZE } from './defaults';
import type { SelectProps } from './types';

export const Select = <T extends ElementType = 'div'>(props: SelectProps<T>) => {
  const theme = useComponentTheme('Select');

  // `data-disabled` is intentionally NOT re-emitted — Spar's Select root sets
  // it. `data-size` and `data-invalid` are takeoff-v2's own visual vocabulary,
  // so they live here and cascade to the Trigger via context.
  const { rootAttrs, rest } = composeRootAttrs(SelectBase, props as SelectProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, invalid }) => ({
      'data-size': size,
      'data-invalid': invalid ? '' : undefined,
    }),
  });

  // `invalid` reaches Spar as given. Spar's root writes `data-invalid` after the
  // props it spreads and falls back to a wrapping Field when the prop is unset,
  // so dropping it — or defaulting it to `false` — erases the state.
  const { size = DEFAULT_SIZE, invalid, contentWidth = DEFAULT_CONTENT_WIDTH, children, ref, ...sparProps } = rest;

  return (
    <SelectProvider value={{ size, invalid: invalid ?? false, contentWidth }}>
      <SparSelect {...(sparProps as unknown as SparSelectProps)} invalid={invalid} ref={ref} {...rootAttrs}>
        {children}
      </SparSelect>
    </SelectProvider>
  );
};

Select.displayName = 'Select';
