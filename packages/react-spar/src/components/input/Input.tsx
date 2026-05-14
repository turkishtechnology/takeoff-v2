import type { ElementType } from 'react';
import { Input as SparInput, type InputProps as SparInputProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputBase } from './base';
import { InputProvider } from './context';
import { DEFAULT_SIZE } from './defaults';
import type { InputProps } from './types';

export const Input = <T extends ElementType = 'div'>(props: InputProps<T>) => {
  const theme = useComponentTheme('Input');

  // `data-invalid`, `data-disabled`, `data-required`, `data-readonly` are NOT
  // emitted here — Spar's Input root already sets them. `data-size` is
  // takeoff-v2's own visual vocabulary, so it lives here.
  const { rootAttrs, rest } = composeRootAttrs(InputBase, props as InputProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE }) => ({
      'data-size': size,
    }),
  });

  const { size = DEFAULT_SIZE, children, ref, ...sparProps } = rest;

  return (
    <InputProvider value={{ size }}>
      <SparInput {...(sparProps as unknown as SparInputProps)} ref={ref} {...rootAttrs}>
        {children}
      </SparInput>
    </InputProvider>
  );
};

Input.displayName = 'Input';
