import type { ElementType } from 'react';
import { SelectContent as SparSelectContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectContentBase } from './base';
import { useSelectOwnContext } from './context';
import type { SelectContentProps } from './types';

export const SelectContent = <T extends ElementType = 'div'>(props: SelectContentProps<T>) => {
  const theme = useComponentTheme('SelectContent');
  const { size } = useSelectOwnContext('Select.Content');

  // Content is portaled outside the root, so the cascading size data-attr has
  // to be re-emitted here for styles to find it via CSS variables / selectors.
  const { rootAttrs, rest } = composeRootAttrs(SelectContentBase, props as SelectContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectContent {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectContent>
  );
};

SelectContent.displayName = 'Select.Content';
