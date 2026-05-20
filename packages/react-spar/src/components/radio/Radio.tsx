import type { ElementType } from 'react';
import { Radio as SparRadio } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioBase } from './base';
import { RadioGroupProvider } from './context';
import { DEFAULT_POSITION, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { RadioProps } from './types';

export const Radio = <T extends ElementType = 'div'>(props: RadioProps<T>) => {
  const theme = useComponentTheme('Radio');

  // Spar emits all state attrs on the radiogroup root itself
  // (`data-orientation`, `data-disabled`, `data-required`, `data-invalid`,
  // `data-select-on-focus`, `data-autofocus`) and resolves them from Field
  // context when nested. The wrapper only layers the Takeoff-specific visual
  // hooks here. `stateAttrs` reads post-merge props so theme.defaultProps for
  // visual props flow through.
  const { rootAttrs, rest } = composeRootAttrs(RadioBase, props as RadioProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, type = DEFAULT_TYPE, position = DEFAULT_POSITION, spread }) => ({
      'data-size': size,
      'data-type': type,
      'data-position': position,
      'data-spread': spread ? '' : undefined,
    }),
  });

  const {
    size = DEFAULT_SIZE,
    type = DEFAULT_TYPE,
    position = DEFAULT_POSITION,
    invalid,
    // `spread` is consumed only as a data-attr above; destructure to keep it
    // out of `sparProps` so the underlying div doesn't receive an unknown
    // boolean DOM attribute.
    spread: _spread,
    children,
    ref,
    ...sparProps
  } = rest;

  return (
    <RadioGroupProvider value={{ size, type, position }}>
      <SparRadio {...sparProps} invalid={invalid} {...rootAttrs} ref={ref}>
        {children}
      </SparRadio>
    </RadioGroupProvider>
  );
};

Radio.displayName = 'Radio';
