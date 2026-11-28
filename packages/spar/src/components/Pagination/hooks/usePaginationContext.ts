import { createContext, useContext } from 'react';
import type { PaginationContextValue } from '../types';

/**
 * Context for pagination component communication
 */
export const PaginationContext = createContext<PaginationContextValue | null>(null);

/**
 * Hook to access the pagination state (current page, page count, visible range
 * and `setPage`) from inside a `Pagination`.
 */
export const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('Pagination components must be used within a Pagination');
  }
  return context;
};
