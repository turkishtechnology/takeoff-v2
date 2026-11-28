import { createComponentBase } from '../../core';

import type {
  PaginationActionsProps,
  PaginationControlsProps,
  PaginationInfoProps,
  PaginationItemsReportProps,
  PaginationNavButtonProps,
  PaginationPageJumpProps,
  PaginationPageReportProps,
  PaginationPageSizeProps,
  PaginationPagesProps,
  PaginationProps,
} from './types';

// @archetype inherited — wraps SparPagination (page state, range, landmark).
// The wrapper keeps `page` and `pageSize` together with useControllableState
// and hands Spar a controlled page, because a page-size change moves the page
// (the first visible item stays on screen) — React state coordination, not
// re-implemented behavior. Root emits data-type / data-mode / data-rounded;
// Spar emits data-disabled / aria-disabled.
export const PaginationBase = createComponentBase<PaginationProps, 'root'>({
  name: 'Pagination',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination' },
});

// @archetype react-enhancement — report column; no Spar part.
export const PaginationInfoBase = createComponentBase<PaginationInfoProps, 'root'>({
  name: 'PaginationInfo',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-info' },
});

// @archetype react-enhancement — `labels.pageStatus` text; no Spar part.
export const PaginationPageReportBase = createComponentBase<PaginationPageReportProps, 'root'>({
  name: 'PaginationPageReport',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-page-report' },
});

// @archetype react-enhancement — `labels.itemsRange` text; no Spar part.
export const PaginationItemsReportBase = createComponentBase<PaginationItemsReportProps, 'root'>({
  name: 'PaginationItemsReport',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-items-report' },
});

// @archetype react-enhancement — the control row; no Spar part.
export const PaginationControlsBase = createComponentBase<PaginationControlsProps, 'root'>({
  name: 'PaginationControls',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-controls' },
});

// @archetype inherited — wraps SparPagination.First.
export const PaginationFirstBase = createComponentBase<PaginationNavButtonProps, 'root'>({
  name: 'PaginationFirst',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-first' },
});

// @archetype inherited — wraps SparPagination.Previous.
export const PaginationPreviousBase = createComponentBase<PaginationNavButtonProps, 'root'>({
  name: 'PaginationPrevious',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-previous' },
});

// @archetype inherited — wraps SparPagination.Next.
export const PaginationNextBase = createComponentBase<PaginationNavButtonProps, 'root'>({
  name: 'PaginationNext',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-next' },
});

// @archetype inherited — wraps SparPagination.Last.
export const PaginationLastBase = createComponentBase<PaginationNavButtonProps, 'root'>({
  name: 'PaginationLast',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-last' },
});

// @archetype react-enhancement root (layout span for the range); its `page`
// and `ellipsis` slots are inherited — SparPagination.Item / .Ellipsis, which
// own `aria-current` and the gap's `aria-hidden`.
export const PaginationPagesBase = createComponentBase<PaginationPagesProps, 'root' | 'page' | 'ellipsis'>({
  name: 'PaginationPages',
  slots: ['root', 'page', 'ellipsis'] as const,
  classes: { root: 'tk-pagination-pages', page: 'tk-pagination-page', ellipsis: 'tk-pagination-ellipsis' },
});

// @archetype react-enhancement — end column; no Spar part.
export const PaginationActionsBase = createComponentBase<PaginationActionsProps, 'root'>({
  name: 'PaginationActions',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-actions' },
});

// @archetype react-enhancement — composes the Takeoff Select; no Spar part.
export const PaginationPageSizeBase = createComponentBase<PaginationPageSizeProps, 'root'>({
  name: 'PaginationPageSize',
  slots: ['root'] as const,
  classes: { root: 'tk-pagination-page-size' },
});

// @archetype react-enhancement — composes the Takeoff Input + Button; owns
// only the draft text. Applying goes through Spar's `setPage`, which rejects
// out-of-range pages. `--tk-pagination-digits` (inline style) sizes the field
// to the page count, a continuous value (Skeleton precedent).
export const PaginationPageJumpBase = createComponentBase<PaginationPageJumpProps, 'root' | 'submit'>({
  name: 'PaginationPageJump',
  slots: ['root', 'submit'] as const,
  classes: { root: 'tk-pagination-page-jump', submit: 'tk-pagination-page-jump-submit' },
});
