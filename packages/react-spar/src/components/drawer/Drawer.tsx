import { Dialog as SparDialog } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import { DrawerProvider } from './context';
import { DEFAULT_PLACEMENT } from './defaults';
import type { DrawerProps } from './types';

// State-only root: renders no DOM, only a context provider. `composeRootAttrs`
// is intentionally skipped — there is no rendered element to receive
// `className` / `data-*` / `slotProps.root`. Shared state reaches the children
// through `DrawerProvider`: the Panel reads `placement` (emitted as
// `data-placement`) and `dismissible` (used to wire the escape/outside-click
// dismiss vetoes), while the Overlay owns its own styling hooks
// (`data-intensity`, `data-invisible`, `data-blur`).
export const Drawer = (props: DrawerProps) => {
  const theme = useComponentTheme('Drawer');
  const merged = { ...theme?.defaultProps, ...props };

  // `forceMount` defaults to `true` so the overlay/panel stay in the DOM across
  // the open → closed boundary, letting the CSS exit transitions in
  // `_drawer.scss` (`&[data-state='closed']`) run before unmount. Without it
  // Spar unmounts on close and the slide-out never plays. Consumers can still
  // opt out by passing `forceMount={false}` — matching `Dialog`.
  const { placement = DEFAULT_PLACEMENT, dismissible = true, disabled = false, forceMount = true, children, ...sparProps } = merged;

  return (
    <DrawerProvider value={{ placement, dismissible }}>
      <SparDialog {...sparProps} disabled={disabled} forceMount={forceMount}>
        {children}
      </SparDialog>
    </DrawerProvider>
  );
};

Drawer.displayName = 'Drawer';
