import type { AriaRole } from 'react';

export interface StatusAttrsInput {
  'role'?: AriaRole;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Default `status` semantics for loading indicators (the `Spinner` contract):
 * `role="status"` plus a default accessible name, unless the consumer names it
 * via `aria-labelledby` or hides it as decorative.
 *
 * Spread the result **after** the native props so an explicit
 * `role={undefined}` / `aria-label={undefined}` falls back to the defaults
 * instead of erasing them.
 */
export const getStatusAttrs = (props: StatusAttrsInput, defaultLabel: string) => {
  const isDecorative = props['aria-hidden'] === true || props['aria-hidden'] === 'true';
  if (isDecorative) return {};

  return {
    'role': props.role ?? 'status',
    'aria-label': props['aria-label'] ?? (props['aria-labelledby'] ? undefined : defaultLabel),
  };
};
