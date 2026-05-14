import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputTrailingIconBase } from './base';
import type { InputTrailingIconProps } from './types';

export const InputTrailingIcon = <T extends ElementType = 'span'>(props: InputTrailingIconProps<T>) => {
  const theme = useComponentTheme('InputTrailingIcon');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputTrailingIconBase, props as InputTrailingIconProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {children}
    </Component>
  );
};

InputTrailingIcon.displayName = 'Input.TrailingIcon';
