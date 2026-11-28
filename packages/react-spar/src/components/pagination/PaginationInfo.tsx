import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PaginationInfoBase } from './base';
import { usePaginationOwnContext } from './context';
import { PaginationItemsReport } from './PaginationItemsReport';
import { PaginationPageReport } from './PaginationPageReport';
import type { PaginationInfoProps } from './types';

export const PaginationInfo = <T extends ElementType = 'div'>(props: PaginationInfoProps<T>) => {
  const theme = useComponentTheme('PaginationInfo');
  usePaginationOwnContext('Pagination.Info');
  const { rootAttrs, rest } = composeRootAttrs(PaginationInfoBase, props as PaginationInfoProps<'div'>, theme);
  const { as, children, ref, ...native } = rest;
  const Component = as ?? 'div';

  return (
    <Component {...native} ref={ref} {...rootAttrs}>
      {children ?? (
        <>
          <PaginationPageReport />
          <PaginationItemsReport />
        </>
      )}
    </Component>
  );
};

PaginationInfo.displayName = 'Pagination.Info';
