import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputSuffixBase } from './base';
import type { InputSuffixProps } from './types';

export const InputSuffix = <T extends ElementType = 'span'>(props: InputSuffixProps<T>) => {
  const theme = useComponentTheme('InputSuffix');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputSuffixBase, props as InputSuffixProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

InputSuffix.displayName = 'Input.Suffix';
