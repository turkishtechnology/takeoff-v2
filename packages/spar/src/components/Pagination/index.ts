import { Pagination as PaginationRoot } from './Pagination';
import { PaginationItem } from './PaginationItem';
import { PaginationFirst, PaginationPrevious, PaginationNext, PaginationLast } from './PaginationNavButtons';
import { PaginationEllipsis } from './PaginationEllipsis';
export { usePaginationContext } from './hooks';
export { getPaginationItems } from './utils';

const Pagination = PaginationRoot as typeof PaginationRoot & {
  Root: typeof PaginationRoot;
  Item: typeof PaginationItem;
  First: typeof PaginationFirst;
  Previous: typeof PaginationPrevious;
  Next: typeof PaginationNext;
  Last: typeof PaginationLast;
  Ellipsis: typeof PaginationEllipsis;
};

Pagination.Root = PaginationRoot;
Pagination.Item = PaginationItem;
Pagination.First = PaginationFirst;
Pagination.Previous = PaginationPrevious;
Pagination.Next = PaginationNext;
Pagination.Last = PaginationLast;
Pagination.Ellipsis = PaginationEllipsis;

export { Pagination, PaginationRoot, PaginationItem, PaginationFirst, PaginationPrevious, PaginationNext, PaginationLast, PaginationEllipsis };

export type {
  PaginationProps,
  PaginationOwnProps,
  PaginationItemProps,
  PaginationItemOwnProps,
  PaginationNavButtonProps,
  PaginationEllipsisProps,
  PaginationContextValue,
  PaginationRangeItem,
  PaginationRangeOptions,
} from './types';
