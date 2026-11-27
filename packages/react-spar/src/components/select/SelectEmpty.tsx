import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectEmptyBase } from './base';
import type { SelectEmptyProps } from './types';

/**
 * What a searched list shows once nothing matches. Rendered by the consumer
 * next to the (now empty) items, inside `Select.Viewport`; announced politely
 * so a screen-reader user hears that the query emptied the list.
 */
export const SelectEmpty = <T extends ElementType = 'div'>(props: SelectEmptyProps<T>) => {
  const theme = useComponentTheme('SelectEmpty');
  const { rootAttrs, rest } = composeRootAttrs(SelectEmptyBase, props as SelectEmptyProps<'div'>, theme);
  const { as, children, ...native } = rest;
  const Component: ElementType = as ?? 'div';

  return (
    <Component role="status" aria-live="polite" {...native} {...rootAttrs}>
      {children}
    </Component>
  );
};

SelectEmpty.displayName = 'Select.Empty';
