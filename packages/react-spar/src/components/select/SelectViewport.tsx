import type { ElementType } from 'react';
import { SelectViewport as SparSelectViewport } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectViewportBase } from './base';
import type { SelectViewportProps } from './types';

/**
 * Scrollable region wrapping the options. In takeoff-v2's viewport-only scroll
 * model this is the sole scroll container (the panel itself no longer scrolls),
 * so long lists must be wrapped in `Select.Viewport`. The native scrollbar is
 * hidden by the token recipe; Spar keeps the highlighted option in view.
 */
export const SelectViewport = <T extends ElementType = 'div'>(props: SelectViewportProps<T>) => {
  const theme = useComponentTheme('SelectViewport');

  const { rootAttrs, rest } = composeRootAttrs(SelectViewportBase, props as SelectViewportProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectViewport {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectViewport>
  );
};

SelectViewport.displayName = 'Select.Viewport';
