import type { ElementType, MouseEvent } from 'react';
import { usePaginationContext } from './hooks';
import type { PaginationItemProps } from './types';

/**
 * Button that selects one page. Marks itself `aria-current="page"` while its
 * page is current; renders the page number when no children are given.
 */
export const PaginationItem = <T extends ElementType = 'button'>({ as, children, page, onClick, ...props }: PaginationItemProps<T>) => {
  const Component = as || 'button';
  const { page: currentPage, disabled, setPage } = usePaginationContext();
  const isCurrent = page === currentPage;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setPage(page);
  };

  return (
    <Component
      type="button"
      {...props}
      disabled={disabled}
      aria-current={isCurrent ? 'page' : undefined}
      data-current={isCurrent ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={handleClick}
    >
      {children ?? page}
    </Component>
  );
};

PaginationItem.displayName = 'PaginationItem';
