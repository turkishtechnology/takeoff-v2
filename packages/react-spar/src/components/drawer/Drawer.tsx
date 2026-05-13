import { Dialog as SparDialog } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import { DrawerProvider } from './context';
import { DEFAULT_PLACEMENT } from './defaults';
import type { DrawerProps } from './types';

// State-only root: renders no DOM, only a context provider. `composeRootAttrs`
// is intentionally skipped — there is no rendered element to receive
// `className` / `data-*` / `slotProps.root`. State-driven styling hooks
// (`data-placement`, `data-disabled`, `data-dismissable`) live on the Panel
// and Overlay parts, which read shared values from `DrawerProvider`.
export const Drawer = (props: DrawerProps) => {
  const theme = useComponentTheme('Drawer');
  const merged = { ...theme?.defaultProps, ...props };

  const { placement = DEFAULT_PLACEMENT, dismissable = true, disabled = false, children, ...sparProps } = merged;

  return (
    <DrawerProvider value={{ placement, dismissable }}>
      <SparDialog {...sparProps} disabled={disabled} forceMount>
        {children}
      </SparDialog>
    </DrawerProvider>
  );
};

Drawer.displayName = 'Drawer';
