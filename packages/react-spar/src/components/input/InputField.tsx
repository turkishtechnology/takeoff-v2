import type { ElementType } from 'react';
import { InputField as SparInputField, type InputFieldProps as SparInputFieldProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputFieldBase } from './base';
import { useInputOwnContext } from './context';
import type { InputFieldProps } from './types';

export const InputField = <T extends ElementType = 'input'>(props: InputFieldProps<T>) => {
  const theme = useComponentTheme('InputField');
  const { size } = useInputOwnContext('Input.Field');

  const { rootAttrs, rest } = composeRootAttrs(InputFieldBase, props as InputFieldProps<'input'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  const { ref, ...spar } = rest;

  return <SparInputField {...(spar as unknown as SparInputFieldProps)} ref={ref} {...rootAttrs} />;
};

InputField.displayName = 'Input.Field';
