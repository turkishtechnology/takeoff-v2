import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../types';

/**
 * One entry of a pagination range: a 1-based page number, or a gap marker
 * standing for the pages it hides on either side of the current window.
 */
export type PaginationRangeItem = number | 'start-ellipsis' | 'end-ellipsis';

/**
 * Options for {@link getPaginationItems}.
 */
export interface PaginationRangeOptions {
  /** Current page, 1-based. Clamped into `1…pageCount`. */
  page: number;
  /** Total number of pages. `0` yields an empty range. */
  pageCount: number;
  /**
   * Pages shown on each side of the current page.
   * @defaultValue 1
   */
  siblingCount?: number;
  /**
   * Pages always shown at the start and at the end.
   * @defaultValue 1
   */
  boundaryCount?: number;
}

/**
 * Context value shared by the pagination parts.
 */
export interface PaginationContextValue {
  /** Current page, 1-based, clamped to `1` and (when known) to `pageCount`. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** The visible range, ellipses included. */
  items: PaginationRangeItem[];
  /** Whether every control is disabled. */
  disabled: boolean;
  /** Requests a page; ignored when disabled, out of range or already current. */
  setPage: (page: number) => void;
}

/**
 * Own props for Pagination
 */
export interface PaginationOwnProps {
  /** Controlled current page, 1-based. */
  page?: number;
  /**
   * Initial page when uncontrolled, 1-based.
   * @defaultValue 1
   */
  defaultPage?: number;
  /** Fires once per page change requested by a control. */
  onPageChange?: (page: number) => void;
  /** Total number of pages. Below 1 the count is unknown: only backward moves are offered. */
  pageCount: number;
  /**
   * Pages shown on each side of the current page.
   * @defaultValue 1
   */
  siblingCount?: number;
  /**
   * Pages always shown at the start and at the end.
   * @defaultValue 1
   */
  boundaryCount?: number;
  /**
   * Disables every control.
   * @defaultValue false
   */
  disabled?: boolean;
}

/**
 * Props for Pagination
 * @remarks Navigation landmark that owns the page state.
 */
export type PaginationProps<T extends ElementType = 'nav'> = PolymorphicProps<'nav', T, PaginationOwnProps>;

/**
 * Own props for PaginationItem
 */
export interface PaginationItemOwnProps {
  /** The 1-based page this control selects. Rendered as content when no children are given. */
  page: number;
}

/**
 * Props for PaginationItem
 * @remarks Button that selects one page; carries `aria-current="page"` when current.
 */
export type PaginationItemProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, PaginationItemOwnProps>;

/**
 * Props for PaginationFirst / PaginationPrevious / PaginationNext / PaginationLast
 * @remarks Button that moves to an edge or neighbouring page; disabled when there is nowhere to go.
 */
export type PaginationNavButtonProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T>;

/**
 * Props for PaginationEllipsis
 * @remarks Non-interactive gap marker, hidden from assistive technology.
 */
export type PaginationEllipsisProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T>;
