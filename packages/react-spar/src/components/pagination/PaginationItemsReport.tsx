import type { ElementType } from 'react';
import { usePaginationContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { PaginationItemsReportBase } from './base';
import { usePaginationOwnContext } from './context';
import type { PaginationItemsReportProps } from './types';

export const PaginationItemsReport = <T extends ElementType = 'span'>(props: PaginationItemsReportProps<T>) => {
  const theme = useComponentTheme('PaginationItemsReport');
  const { labels, totalItems, pageSize } = usePaginationOwnContext('Pagination.ItemsReport');
  const { page } = usePaginationContext();
  const { rootAttrs, rest } = composeRootAttrs(PaginationItemsReportBase, props as PaginationItemsReportProps<'span'>, theme);
  const { as, children, ref, ...native } = rest;
  const Component = as ?? 'span';

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const text = totalItems === 0 ? formatLabel(labels.noItems, { total: 0 }) : formatLabel(labels.itemsRange, { start, end, total: totalItems });

  return (
    <Component aria-live="polite" {...native} ref={ref} {...rootAttrs}>
      {children ?? text}
    </Component>
  );
};

PaginationItemsReport.displayName = 'Pagination.ItemsReport';
