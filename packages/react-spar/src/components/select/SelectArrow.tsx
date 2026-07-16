import type { ElementType } from 'react';
import { SelectArrow as SparSelectArrow } from '@turkish-technology/spar';

import { composeRootAttrs, renderPointerArrow } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectArrowBase } from './base';
import type { SelectArrowProps, SelectArrowSlot } from './types';

/**
 * Optional arrow pointing from the content panel to the trigger. Rendered as an
 * `<svg>` whose fill follows the recipe `color` so it matches the panel surface;
 * Spar's Floating UI middleware positions it. Place it inside `Select.Content`,
 * as a sibling of `Select.Viewport`.
 */
export const SelectArrow = <T extends ElementType = 'svg'>(props: SelectArrowProps<T>) => {
  const theme = useComponentTheme('SelectArrow');

  const { rootAttrs, rest } = composeRootAttrs<SelectArrowProps, SelectArrowSlot>(SelectArrowBase, props as SelectArrowProps<'svg'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparSelectArrow {...sparProps} {...rootAttrs} ref={ref}>
      {children ?? renderPointerArrow()}
    </SparSelectArrow>
  );
};

SelectArrow.displayName = 'Select.Arrow';
