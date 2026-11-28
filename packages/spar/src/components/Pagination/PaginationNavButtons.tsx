import type { ElementType, MouseEvent } from 'react';
import { usePaginationContext } from './hooks';
import type { PaginationContextValue, PaginationNavButtonProps } from './types';

type Target = (context: PaginationContextValue) => number;

const createNavButton = (displayName: string, target: Target) => {
  const NavButton = <T extends ElementType = 'button'>({ as, children, onClick, ...props }: PaginationNavButtonProps<T>) => {
    const Component = as || 'button';
    const context = usePaginationContext();
    const destination = target(context);
    // Backward needs a page below the current one; forward needs a known page
    // count that reaches the destination.
    const isUnavailable = context.disabled || destination === context.page || destination < 1 || (destination > context.page && destination > context.pageCount);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      context.setPage(destination);
    };

    return (
      <Component type="button" {...props} disabled={isUnavailable} data-disabled={isUnavailable ? '' : undefined} onClick={handleClick}>
        {children}
      </Component>
    );
  };
  NavButton.displayName = displayName;
  return NavButton;
};

/** Moves to page 1; disabled on the first page. */
export const PaginationFirst = createNavButton('PaginationFirst', () => 1);

/** Moves one page back; disabled on the first page. */
export const PaginationPrevious = createNavButton('PaginationPrevious', ({ page }) => page - 1);

/** Moves one page forward; disabled on the last page. */
export const PaginationNext = createNavButton('PaginationNext', ({ page }) => page + 1);

/** Moves to the last page; disabled on the last page. */
export const PaginationLast = createNavButton('PaginationLast', ({ pageCount }) => pageCount);
