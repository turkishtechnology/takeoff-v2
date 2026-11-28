import type { ElementType } from 'react';
import type { PaginationEllipsisProps } from './types';

/**
 * Non-interactive marker for hidden pages. Hidden from assistive technology:
 * the page buttons on either side already announce where the range jumps.
 */
export const PaginationEllipsis = <T extends ElementType = 'span'>({ as, children, ...props }: PaginationEllipsisProps<T>) => {
  const Component = as || 'span';

  return (
    <Component aria-hidden="true" {...props}>
      {children ?? '…'}
    </Component>
  );
};

PaginationEllipsis.displayName = 'PaginationEllipsis';
