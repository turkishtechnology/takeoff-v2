// Phase 1 is props-first: only the `Table` root is public. The internal render
// parts (Header / Body / Row / Cell / Pagination / …) are deliberately NOT
// exported — the compound surface (Tier 2) is deferred until a real
// bespoke-layout need appears (RFC §3.1, §9). `getExportRows` is the data-only
// export surface (RFC §5); the export engine stays consumer-side.
export { Table } from './Table';
export { getExportRows } from './helpers';

export type {
  ControlledState,
  TableAlign,
  TableColumnAccessor,
  TableColumnDef,
  TableColumnFilter,
  TableColumnFilterContext,
  TableColumnFilterOption,
  TableColumnFilterType,
  TableColumnMeta,
  TableDataRequest,
  TableExpansionConfig,
  TableFilteringConfig,
  TablePaginationConfig,
  TableProps,
  TableSelectionConfig,
  TableSize,
  TableSlot,
  TableSortingConfig,
  TableStickySide,
} from './types';
