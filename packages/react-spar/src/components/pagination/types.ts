import type { ElementType, ReactNode } from 'react';
import type { PaginationProps as SparPaginationProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Visual style (Core vocabulary). `'outlined'` borders every page cell,
 * `'text'` leaves them bare, `'grouped'` draws one box around the control row
 * with dividers between the edge buttons.
 */
export type PaginationType = 'outlined' | 'text' | 'grouped';

/**
 * Layout mode (Core vocabulary). `'default'` shows the page list with
 * First/Last; `'compact'` shows Previous, a page input, the page report and
 * Next.
 */
export type PaginationMode = 'default' | 'compact';

/**
 * User-facing strings of a Pagination. Dynamic entries are templates whose
 * `{placeholders}` Pagination fills in, so word order stays with the
 * translation. Empty and whitespace-only values fall back to the default.
 */
export interface PaginationLabels {
  /** Accessible name of the navigation landmark. @defaultValue 'Pagination' */
  landmark: string;
  /** Page report. @defaultValue 'Page {page} of {pageCount}' */
  pageStatus: string;
  /** Item report (1-based range). @defaultValue 'Items {start}-{end} of {total}' */
  itemsRange: string;
  /** Item report when there are no items (`{total}` is 0). @defaultValue '0 items' */
  noItems: string;
  /** @defaultValue 'First page' */
  firstPage: string;
  /** @defaultValue 'Previous page' */
  previousPage: string;
  /** @defaultValue 'Next page' */
  nextPage: string;
  /** @defaultValue 'Last page' */
  lastPage: string;
  /** Accessible name of a page button. @defaultValue 'Go to page {page}' */
  pageButton: string;
  /** Accessible name of the current page's button. @defaultValue 'Page {page}, current page' */
  currentPageButton: string;
  /** Accessible name of the page-size select. @defaultValue 'Rows per page' */
  rowsPerPage: string;
  /** Accessible name of the page-jump input. @defaultValue 'Go to page' */
  pageJumpInput: string;
  /** Accessible name of the page-jump submit button. @defaultValue 'Go' */
  pageJumpSubmit: string;
}

export type PaginationSlot = 'root';
export type PaginationInfoSlot = 'root';
export type PaginationPageReportSlot = 'root';
export type PaginationItemsReportSlot = 'root';
export type PaginationControlsSlot = 'root';
export type PaginationNavButtonSlot = 'root';
export type PaginationPagesSlot = 'root' | 'page' | 'ellipsis';
export type PaginationActionsSlot = 'root';
export type PaginationPageSizeSlot = 'root';
export type PaginationPageJumpSlot = 'root' | 'submit';

export interface PaginationOwnProps {
  /** Total number of items across all pages. The page count is `ceil(totalItems / pageSize)`. */
  totalItems: number;
  /** Controlled page size. */
  pageSize?: number;
  /**
   * Initial page size when uncontrolled.
   * @defaultValue 10
   */
  defaultPageSize?: number;
  /**
   * Fires once per page-size change. When the change moves the page (the first
   * visible item stays on screen), `onPageChange` fires first.
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Visual style. Emitted as `data-type` on the root.
   * @defaultValue 'outlined'
   */
  type?: PaginationType;
  /**
   * Layout mode. Picks the default anatomy and is emitted as `data-mode`.
   * @defaultValue 'default'
   */
  mode?: PaginationMode;
  /**
   * Fully rounded page cells. Emitted as `data-rounded`.
   * @defaultValue false
   */
  rounded?: boolean;
  /** Per-key overrides of the user-facing strings, merged over provider `defaultProps.labels`. */
  labels?: Partial<PaginationLabels>;
  /** Parts to render; without children the root renders the default anatomy for its `mode`. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<PaginationSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<PaginationSlot>;
}

export type PaginationProps<T extends ElementType = 'nav'> = PolymorphicProps<
  'nav',
  T,
  PaginationOwnProps &
    // Spar Pagination page state and range shape. `pageCount` is excluded:
    // the wrapper derives it from `totalItems` / `pageSize`, and `aria-label`
    // comes from `labels.landmark` unless set directly.
    Pick<SparPaginationProps, 'page' | 'defaultPage' | 'onPageChange' | 'siblingCount' | 'boundaryCount' | 'disabled'>
>;

interface PartOwnProps<TSlot extends string> {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TSlot>;
}

export interface PaginationInfoOwnProps extends PartOwnProps<PaginationInfoSlot> {
  /** Report parts; defaults to `Pagination.PageReport` + `Pagination.ItemsReport`. */
  children?: ReactNode;
}
export type PaginationInfoProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PaginationInfoOwnProps>;

export interface PaginationPageReportOwnProps extends PartOwnProps<PaginationPageReportSlot> {
  /** Replaces the `labels.pageStatus` text. */
  children?: ReactNode;
}
export type PaginationPageReportProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, PaginationPageReportOwnProps>;

export interface PaginationItemsReportOwnProps extends PartOwnProps<PaginationItemsReportSlot> {
  /** Replaces the `labels.itemsRange` / `labels.noItems` text. */
  children?: ReactNode;
}
export type PaginationItemsReportProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, PaginationItemsReportOwnProps>;

export interface PaginationControlsOwnProps extends PartOwnProps<PaginationControlsSlot> {
  /** Control parts; defaults follow the root `mode`. */
  children?: ReactNode;
}
export type PaginationControlsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PaginationControlsOwnProps>;

export interface PaginationNavButtonOwnProps extends PartOwnProps<PaginationNavButtonSlot> {
  /** Replaces the default chevron glyph. The accessible name stays `labels.*`. */
  children?: ReactNode;
}
export type PaginationNavButtonProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, PaginationNavButtonOwnProps>;

export type PaginationPagesProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, PartOwnProps<PaginationPagesSlot>>;

export interface PaginationActionsOwnProps extends PartOwnProps<PaginationActionsSlot> {
  /** Action parts; defaults to `Pagination.PageSize` (+ `Pagination.PageJump` in `default` mode). */
  children?: ReactNode;
}
export type PaginationActionsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PaginationActionsOwnProps>;

export interface PaginationPageSizeOwnProps extends PartOwnProps<PaginationPageSizeSlot> {
  /**
   * Page sizes to offer. The active size is added when it is missing.
   * @defaultValue [5, 10, 20, 50]
   */
  options?: number[];
}
export type PaginationPageSizeProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PaginationPageSizeOwnProps>;

export interface PaginationPageJumpOwnProps extends PartOwnProps<PaginationPageJumpSlot> {
  /**
   * Whether leaving the input applies the typed page. When `false`, only Enter
   * (or the submit button) applies it and blur restores the current page.
   * @defaultValue true
   */
  applyOnBlur?: boolean;
}
export type PaginationPageJumpProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, PaginationPageJumpOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Pagination: import('../../core').ComponentThemeConfig<PaginationProps>;
    PaginationInfo: import('../../core').ComponentThemeConfig<PaginationInfoProps>;
    PaginationPageReport: import('../../core').ComponentThemeConfig<PaginationPageReportProps>;
    PaginationItemsReport: import('../../core').ComponentThemeConfig<PaginationItemsReportProps>;
    PaginationControls: import('../../core').ComponentThemeConfig<PaginationControlsProps>;
    PaginationFirst: import('../../core').ComponentThemeConfig<PaginationNavButtonProps>;
    PaginationPrevious: import('../../core').ComponentThemeConfig<PaginationNavButtonProps>;
    PaginationNext: import('../../core').ComponentThemeConfig<PaginationNavButtonProps>;
    PaginationLast: import('../../core').ComponentThemeConfig<PaginationNavButtonProps>;
    PaginationPages: import('../../core').ComponentThemeConfig<PaginationPagesProps, PaginationPagesSlot>;
    PaginationActions: import('../../core').ComponentThemeConfig<PaginationActionsProps>;
    PaginationPageSize: import('../../core').ComponentThemeConfig<PaginationPageSizeProps>;
    PaginationPageJump: import('../../core').ComponentThemeConfig<PaginationPageJumpProps, PaginationPageJumpSlot>;
  }
}
