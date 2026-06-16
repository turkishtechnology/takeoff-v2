import { Dialog as SparDialog } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import { DrawerProvider } from './context';
import { DEFAULT_PLACEMENT } from './defaults';
import type { DrawerProps } from './types';

// State-only root: renders no DOM, only a context provider. `composeRootAttrs`
// is intentionally skipped — there is no rendered element to receive
// `className` / `data-*` / `slotProps.root`. State-driven styling hooks
// (`data-placement`, `data-disabled`, `data-dismissible`) live on the Panel
// and Overlay parts, which read shared values from `DrawerProvider`.
export const Drawer = (props: DrawerProps) => {
  const theme = useComponentTheme('Drawer');
  const merged = { ...theme?.defaultProps, ...props };

  const { placement = DEFAULT_PLACEMENT, dismissible = true, disabled = false, children, ...sparProps } = merged;

  return (
    <DrawerProvider value={{ placement, dismissible }}>
      {/*
        forceMount is hardcoded: the Drawer's slide-in/out transition needs
        the panel to stay in the DOM across the open → closed boundary, so
        CSS exit animations can run before unmount. Exposing it as a knob
        would let consumers break the visual contract; if a use case ever
        needs unmount-on-close, treat it as a contract change.
      */}
      <SparDialog {...sparProps} disabled={disabled} forceMount>
        {children}
      </SparDialog>
    </DrawerProvider>
  );
};

Drawer.displayName = 'Drawer';
