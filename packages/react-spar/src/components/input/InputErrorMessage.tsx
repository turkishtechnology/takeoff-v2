import type { ElementType } from 'react';
import { InputErrorMessage as SparInputErrorMessage } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputErrorMessageBase } from './base';
import type { InputErrorMessageProps } from './types';

export const InputErrorMessage = <T extends ElementType = 'div'>(props: InputErrorMessageProps<T>) => {
  const theme = useComponentTheme('InputErrorMessage');

  const { rootAttrs, rest } = composeRootAttrs(InputErrorMessageBase, props as InputErrorMessageProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparInputErrorMessage {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparInputErrorMessage>
  );
};

InputErrorMessage.displayName = 'Input.ErrorMessage';
