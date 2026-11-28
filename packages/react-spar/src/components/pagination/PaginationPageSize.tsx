import type { ElementType } from 'react';
import { usePaginationContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Select } from '../select';

import { PaginationPageSizeBase } from './base';
import { usePaginationOwnContext } from './context';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './defaults';
import type { PaginationPageSizeProps } from './types';

export const PaginationPageSize = <T extends ElementType = 'div'>(props: PaginationPageSizeProps<T>) => {
  const theme = useComponentTheme('PaginationPageSize');
  const { labels, pageSize, setPageSize } = usePaginationOwnContext('Pagination.PageSize');
  const { disabled } = usePaginationContext();
  const { rootAttrs, rest } = composeRootAttrs(PaginationPageSizeBase, props as PaginationPageSizeProps<'div'>, theme);
  const { as, options = DEFAULT_PAGE_SIZE_OPTIONS, ref, ...native } = rest;
  const Component = as ?? 'div';

  // A `pageSize` outside `options` still needs a matching item, so it is
  // folded in (sorted) instead of leaving the Select on an unselectable value.
  const sizes = options.includes(pageSize) ? options : [...options, pageSize].sort((a, b) => a - b);

  return (
    <Component {...native} ref={ref} {...rootAttrs}>
      <Select size="small" value={String(pageSize)} onChange={value => setPageSize(Number(value))} disabled={disabled}>
        <Select.Trigger aria-label={labels.rowsPerPage}>{pageSize}</Select.Trigger>
        <Select.Content>
          {sizes.map(option => (
            <Select.Item key={option} value={String(option)}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Component>
  );
};

PaginationPageSize.displayName = 'Pagination.PageSize';
