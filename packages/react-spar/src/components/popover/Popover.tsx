import { Popover as SparPopover } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import type { PopoverProps } from './types';

// State root. Spar's Popover wraps `children` in a plain block
// `<div data-state="open" | "closed">` that it owns; the wrapper exposes no
// `as`, `className`, `classNames` or `slotProps` for it, so `composeRootAttrs`
// is intentionally skipped — there is no takeoff-owned root slot to compose.
// Style the parts (`Popover.Trigger`, `Popover.Content`, …) instead.
export const Popover = (props: PopoverProps) => {
  const theme = useComponentTheme('Popover');
  const merged = { ...theme?.defaultProps, ...props };

  const { children, ...sparProps } = merged;

  return <SparPopover {...sparProps}>{children}</SparPopover>;
};

Popover.displayName = 'Popover';
