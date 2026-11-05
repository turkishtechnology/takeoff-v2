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

// Test-only: the flag is module-level, so a test that expects the warning would
// depend on test order without a reset. Not re-exported from the barrel.
export const resetTableDevWarnings = (): void => {
  warnedFilterButtonName = false;
};
