import { Popover as SparPopover } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import type { PopoverProps } from './types';

// State-only root: renders no DOM, only provides state context via Spar.
// `composeRootAttrs` is intentionally skipped — there is no rendered element
// to receive `className` / `data-*` / `slotProps.root`.
export const Popover = (props: PopoverProps) => {
  const theme = useComponentTheme('Popover');
  const merged = { ...theme?.defaultProps, ...props };

  const { children, ...sparProps } = merged;

  return <SparPopover {...sparProps}>{children}</SparPopover>;
};

Popover.displayName = 'Popover';
