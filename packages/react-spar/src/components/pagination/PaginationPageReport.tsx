import type { ElementType } from 'react';
import { usePaginationContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { PaginationPageReportBase } from './base';
import { usePaginationOwnContext } from './context';
import type { PaginationPageReportProps } from './types';

export const PaginationPageReport = <T extends ElementType = 'span'>(props: PaginationPageReportProps<T>) => {
  const theme = useComponentTheme('PaginationPageReport');
  const { labels } = usePaginationOwnContext('Pagination.PageReport');
  const { page, pageCount } = usePaginationContext();
  const { rootAttrs, rest } = composeRootAttrs(PaginationPageReportBase, props as PaginationPageReportProps<'span'>, theme);
  const { as, children, ref, ...native } = rest;
  const Component = as ?? 'span';

  return (
    <Component aria-live="polite" {...native} ref={ref} {...rootAttrs}>
      {children ?? formatLabel(labels.pageStatus, { page: pageCount > 0 ? page : 0, pageCount })}
    </Component>
  );
};

PaginationPageReport.displayName = 'Pagination.PageReport';
