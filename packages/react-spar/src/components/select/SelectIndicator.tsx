import { type ElementType } from 'react';
import { useSelectContext } from '@turkish-technology/spar';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectIndicatorBase } from './base';
import type { SelectIndicatorProps } from './types';

// Default disclosure chevrons from the official Takeoff icon set
// (`@takeoff-icons/react`, outlined/rounded — the design system default
// variant). The icons size to `1em` and paint with `currentColor`, so the
// `tk-select-indicator` recipe drives their size and color. Mirrors the
// Accordion indicator; the built-in Select.Trigger indicator renders the same
// glyphs.
const DEFAULT_EXPAND_ICON = <ChevronBottomIconOutlinedRounded />;
const DEFAULT_COLLAPSE_ICON = <ChevronTopIconOutlinedRounded />;

export const SelectIndicator = <T extends ElementType = 'span'>(props: SelectIndicatorProps<T>) => {
  const theme = useComponentTheme('SelectIndicator');
  const { isOpen } = useSelectContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(SelectIndicatorBase, props as SelectIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  const resolved = typeof children === 'function' ? children({ isOpen }) : (children ?? (isOpen ? DEFAULT_COLLAPSE_ICON : DEFAULT_EXPAND_ICON));

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

SelectIndicator.displayName = 'Select.Indicator';
