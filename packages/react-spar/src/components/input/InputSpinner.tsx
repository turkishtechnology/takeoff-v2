import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputSpinnerBase } from './base';
import { useInputOwnContext } from './context';
import type { InputSpinnerProps } from './types';

export const InputSpinner = <T extends ElementType = 'span'>(props: InputSpinnerProps<T>) => {
  const theme = useComponentTheme('InputSpinner');
  useInputOwnContext('Input.Spinner');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputSpinnerBase, props as InputSpinnerProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component aria-hidden="true" {...rendered} ref={ref} {...rootAttrs}>
      {children ?? <span className="tk-input-default-spinner" />}
    </Component>
  );
};

InputSpinner.displayName = 'Input.Spinner';
