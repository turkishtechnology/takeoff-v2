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

  // `forceMount` defaults to `true` so the overlay/panel stay in the DOM
  // across the open → closed boundary, letting the CSS exit transitions in
  // `_dialog.scss` (`&[data-state='closed']`) run before unmount. Without it
  // Spar unmounts on close and the close animation never plays. Consumers can
  // still opt out by passing `forceMount={false}`.
  const { dismissible = true, forceMount = true, children, ...sparProps } = merged;

  return (
    <DialogProvider value={{ dismissible }}>
      <SparDialog {...sparProps} forceMount={forceMount}>
        {children}
      </SparDialog>
    </DialogProvider>
  );
};

Dialog.displayName = 'Dialog';
