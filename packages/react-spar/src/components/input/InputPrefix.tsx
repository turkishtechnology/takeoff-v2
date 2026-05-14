import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputPrefixBase } from './base';
import type { InputPrefixProps } from './types';

export const InputPrefix = <T extends ElementType = 'span'>(props: InputPrefixProps<T>) => {
  const theme = useComponentTheme('InputPrefix');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputPrefixBase, props as InputPrefixProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

InputPrefix.displayName = 'Input.Prefix';
