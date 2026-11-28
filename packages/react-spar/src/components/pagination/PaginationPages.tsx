import type { ElementType } from 'react';
import { PaginationEllipsis as SparPaginationEllipsis, PaginationItem as SparPaginationItem, usePaginationContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { PaginationPagesBase } from './base';
import { usePaginationOwnContext } from './context';
import type { PaginationPagesProps } from './types';

/**
 * The page range: one button per visible page and an `aria-hidden` ellipsis
 * for each gap. The range itself (siblings, boundaries, clamping) comes from
 * the Spar root.
 */
export const PaginationPages = <T extends ElementType = 'span'>(props: PaginationPagesProps<T>) => {
  const theme = useComponentTheme('PaginationPages');
  const { labels } = usePaginationOwnContext('Pagination.Pages');
  const { items, page: currentPage } = usePaginationContext();
  const { rootAttrs, rest } = composeRootAttrs(PaginationPagesBase, props as PaginationPagesProps<'span'>, theme);
  const { as, ref, ...native } = rest;
  const Component = as ?? 'span';

  const layers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };

  return (
    <Component {...native} ref={ref} {...rootAttrs}>
      {items.map(item => {
        if (typeof item !== 'number') {
          return <SparPaginationEllipsis key={item} {...buildSlotAttrs(PaginationPagesBase.getSlotProps('ellipsis'), 'ellipsis', layers)} />;
        }
        const label = formatLabel(item === currentPage ? labels.currentPageButton : labels.pageButton, { page: item });
        return (
          <SparPaginationItem
            key={item}
            page={item}
            {...buildSlotAttrs(PaginationPagesBase.getSlotProps('page', { 'className': undefined as string | undefined, 'aria-label': label }), 'page', layers)}
          />
        );
      })}
    </Component>
  );
};

PaginationPages.displayName = 'Pagination.Pages';
