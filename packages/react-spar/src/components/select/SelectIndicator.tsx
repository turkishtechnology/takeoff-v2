import { type ElementType } from 'react';
import { useSelectContext } from '@turkish-technology/spar';

import { composeRootAttrs, resolveDisclosureIndicator } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectIndicatorBase } from './base';
import type { SelectIndicatorProps } from './types';

export const SelectIndicator = <T extends ElementType = 'span'>(props: SelectIndicatorProps<T>) => {
  const theme = useComponentTheme('SelectIndicator');
  const { isOpen } = useSelectContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(SelectIndicatorBase, props as SelectIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  // Default chevron flips with the open state; the shared `tk-select-indicator`
  // recipe drives its size/color (the glyph is `1em` + `currentColor`).
  const resolved = resolveDisclosureIndicator(children, isOpen);

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

SelectIndicator.displayName = 'Select.Indicator';
