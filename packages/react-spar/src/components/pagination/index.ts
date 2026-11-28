import { Pagination as PaginationRoot } from './Pagination';
import { PaginationActions } from './PaginationActions';
import { PaginationControls } from './PaginationControls';
import { PaginationInfo } from './PaginationInfo';
import { PaginationItemsReport } from './PaginationItemsReport';
import { PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious } from './PaginationNavButtons';
import { PaginationPageJump } from './PaginationPageJump';
import { PaginationPageReport } from './PaginationPageReport';
import { PaginationPageSize } from './PaginationPageSize';
import { PaginationPages } from './PaginationPages';

const Pagination = Object.assign(PaginationRoot, {
  Info: PaginationInfo,
  PageReport: PaginationPageReport,
  ItemsReport: PaginationItemsReport,
  Controls: PaginationControls,
  First: PaginationFirst,
  Previous: PaginationPrevious,
  Pages: PaginationPages,
  Next: PaginationNext,
  Last: PaginationLast,
  Actions: PaginationActions,
  PageSize: PaginationPageSize,
  PageJump: PaginationPageJump,
});

export { Pagination };

export type {
  PaginationActionsProps,
  PaginationControlsProps,
  PaginationInfoProps,
  PaginationItemsReportProps,
  PaginationLabels,
  PaginationMode,
  PaginationNavButtonProps,
  PaginationPageJumpProps,
  PaginationPageReportProps,
  PaginationPageSizeProps,
  PaginationPagesProps,
  PaginationProps,
  PaginationType,
} from './types';
