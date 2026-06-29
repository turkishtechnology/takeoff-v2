import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputTrailingIconBase } from './base';
import { useInputOwnContext } from './context';
import type { InputTrailingIconProps } from './types';

export const InputTrailingIcon = <T extends ElementType = 'span'>(props: InputTrailingIconProps<T>) => {
  const theme = useComponentTheme('InputTrailingIcon');
  useInputOwnContext('Input.TrailingIcon');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputTrailingIconBase, props as InputTrailingIconProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component aria-hidden="true" {...rendered} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

InputTrailingIcon.displayName = 'Input.TrailingIcon';
