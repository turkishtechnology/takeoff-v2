import type { ElementType } from 'react';
import { FieldErrorMessage as SparFieldErrorMessage } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FieldErrorMessageBase } from './base';
import type { FieldErrorMessageProps } from './types';

export const FieldErrorMessage = <T extends ElementType = 'div'>(props: FieldErrorMessageProps<T>) => {
  const theme = useComponentTheme('FieldErrorMessage');

  const { rootAttrs, rest } = composeRootAttrs(FieldErrorMessageBase, props as FieldErrorMessageProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparFieldErrorMessage {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparFieldErrorMessage>
  );
};

FieldErrorMessage.displayName = 'Field.ErrorMessage';
