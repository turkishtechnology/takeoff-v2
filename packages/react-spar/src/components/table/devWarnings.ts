import { isDevelopment } from '../../utils';

// `slotProps.filterButton` naming attributes renamed the trigger before `labels`
// existed; they are dropped now, so tell developers once where the name moved.
let warnedFilterButtonName = false;

export const warnIgnoredFilterButtonName = (ariaLabel: unknown, ariaLabelledBy: unknown): void => {
  if (warnedFilterButtonName || (ariaLabel === undefined && ariaLabelledBy === undefined) || !isDevelopment()) return;
  warnedFilterButtonName = true;
  // eslint-disable-next-line no-console
  console.warn("[Table] slotProps.filterButton['aria-label'] / ['aria-labelledby'] is ignored; use labels.filterButton (it accepts a {column} placeholder).");
};

// A filtered column with no `filter.label` and no string `header` names its
// filter controls after the raw column id; tell developers once per column.
const warnedIdFallbackColumns = new Set<string>();

export const warnFilterLabelFallsBackToId = (columnId: string): void => {
  if (warnedIdFallbackColumns.has(columnId) || !isDevelopment()) return;
  warnedIdFallbackColumns.add(columnId);
  // eslint-disable-next-line no-console
  console.warn(`[Table] Column "${columnId}" has a filter but no text header, so its filter controls are named after the column id. Set filter.label to a readable column name.`);
};

// Test-only: the flags are module-level, so a test that expects a warning would
// depend on test order without a reset. Not re-exported from the barrel.
export const resetTableDevWarnings = (): void => {
  warnedFilterButtonName = false;
  warnedIdFallbackColumns.clear();
};
