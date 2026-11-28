import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PaginationControlsBase } from './base';
import { usePaginationOwnContext } from './context';
import { PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious } from './PaginationNavButtons';
import { PaginationPageJump } from './PaginationPageJump';
import { PaginationPageReport } from './PaginationPageReport';
import { PaginationPages } from './PaginationPages';
import type { PaginationControlsProps } from './types';

export const PaginationControls = <T extends ElementType = 'div'>(props: PaginationControlsProps<T>) => {
  const theme = useComponentTheme('PaginationControls');
  const { mode } = usePaginationOwnContext('Pagination.Controls');
  const { rootAttrs, rest } = composeRootAttrs(PaginationControlsBase, props as PaginationControlsProps<'div'>, theme);
  const { as, children, ref, ...native } = rest;
  const Component = as ?? 'div';

  const defaults =
    mode === 'compact' ? (
      <>
        <PaginationPrevious />
        <PaginationPageJump />
        <PaginationPageReport />
        <PaginationNext />
      </>
    ) : (
      <>
        <PaginationFirst />
        <PaginationPrevious />
        <PaginationPages />
        <PaginationNext />
        <PaginationLast />
      </>
    );

  return (
    <Component {...native} ref={ref} {...rootAttrs}>
      {children ?? defaults}
    </Component>
  );
};

PaginationControls.displayName = 'Pagination.Controls';
