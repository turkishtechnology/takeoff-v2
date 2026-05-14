import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputLeadingIconBase } from './base';
import type { InputLeadingIconProps } from './types';

export const InputLeadingIcon = <T extends ElementType = 'span'>(props: InputLeadingIconProps<T>) => {
  const theme = useComponentTheme('InputLeadingIcon');
  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputLeadingIconBase, props as InputLeadingIconProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {children}
    </Component>
  );
};

InputLeadingIcon.displayName = 'Input.LeadingIcon';
