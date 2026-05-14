import type { ElementType } from 'react';
import { RadioRoot as SparRadioRoot } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioBase } from './base';
import { RadioGroupProvider } from './context';
import { DEFAULT_POSITION, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { RadioProps } from './types';

export const Radio = <T extends ElementType = 'div'>(props: RadioProps<T>) => {
  const theme = useComponentTheme('Radio');

  // Spar already emits `data-orientation`, `data-disabled`, `data-required`,
  // `data-select-on-focus`, `data-autofocus` on the radiogroup root, so the
  // wrapper layers only the Takeoff visual hooks here. `stateAttrs` reads
  // post-merge props so theme.defaultProps for visual props flow through.
  const { rootAttrs, rest } = composeRootAttrs(RadioBase, props as RadioProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, type = DEFAULT_TYPE, position = DEFAULT_POSITION, invalid, spread }) => ({
      'data-size': size,
      'data-type': type,
      'data-position': position,
      'data-invalid': invalid ? '' : undefined,
      'data-spread': spread ? '' : undefined,
    }),
  });

  const {
    size = DEFAULT_SIZE,
    type = DEFAULT_TYPE,
    position = DEFAULT_POSITION,
    invalid = false,
    // `spread` is consumed only as a data-attr above; destructure to keep it
    // out of `sparProps` so the underlying div doesn't receive an unknown
    // boolean DOM attribute.
    spread: _spread,
    children,
    ref,
    ...sparProps
  } = rest;

  return (
    <RadioGroupProvider value={{ size, type, invalid, position }}>
      <SparRadioRoot {...sparProps} {...rootAttrs} ref={ref}>
        {children}
      </SparRadioRoot>
    </RadioGroupProvider>
  );
};

Radio.displayName = 'Radio';
