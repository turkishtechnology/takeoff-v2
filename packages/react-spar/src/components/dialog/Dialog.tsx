import { Dialog as SparDialog } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import { DialogProvider } from './context';
import type { DialogProps } from './types';

// State-only root: renders no DOM, only provides state context via Spar.
// `composeRootAttrs` is intentionally skipped — there is no rendered element
// to receive `className` / `data-*` / `slotProps.root`.
export const Dialog = (props: DialogProps) => {
  const theme = useComponentTheme('Dialog');
  const merged = { ...theme?.defaultProps, ...props };

  const { dismissable = true, children, ...sparProps } = merged;

  return (
    <DialogProvider value={{ dismissable }}>
      <SparDialog {...sparProps}>{children}</SparDialog>
    </DialogProvider>
  );
};

Dialog.displayName = 'Dialog';
