import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PaginationActionsBase } from './base';
import { usePaginationOwnContext } from './context';
import { PaginationPageJump } from './PaginationPageJump';
import { PaginationPageSize } from './PaginationPageSize';
import type { PaginationActionsProps } from './types';

export const PaginationActions = <T extends ElementType = 'div'>(props: PaginationActionsProps<T>) => {
  const theme = useComponentTheme('PaginationActions');
  // Compact already carries a page input in its control row, so its actions
  // only offer the page size.
  const { mode } = usePaginationOwnContext('Pagination.Actions');
  const { rootAttrs, rest } = composeRootAttrs(PaginationActionsBase, props as PaginationActionsProps<'div'>, theme);
  const { as, children, ref, ...native } = rest;
  const Component = as ?? 'div';

  return (
    <Component {...native} ref={ref} {...rootAttrs}>
      {children ?? (
        <>
          <PaginationPageSize />
          {mode === 'default' && <PaginationPageJump />}
        </>
      )}
    </Component>
  );
};

PaginationActions.displayName = 'Pagination.Actions';
