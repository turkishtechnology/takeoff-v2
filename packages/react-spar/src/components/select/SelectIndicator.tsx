import { type ElementType } from 'react';
import { useSelectContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectIndicatorBase } from './base';
import { defaultIndicatorIcon } from './chevrons';
import type { SelectIndicatorProps } from './types';

export const SelectIndicator = <T extends ElementType = 'span'>(props: SelectIndicatorProps<T>) => {
  const theme = useComponentTheme('SelectIndicator');
  const { isOpen } = useSelectContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(SelectIndicatorBase, props as SelectIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  const resolved = typeof children === 'function' ? children({ isOpen }) : (children ?? defaultIndicatorIcon(isOpen));

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

SelectIndicator.displayName = 'Select.Indicator';
