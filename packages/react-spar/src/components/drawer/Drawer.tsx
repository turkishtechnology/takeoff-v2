import { Dialog as SparDialog } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerBase } from './base';
import { DrawerProvider } from './context';
import { DEFAULT_PLACEMENT } from './defaults';
import type { DrawerProps } from './types';

export const Drawer = (props: DrawerProps) => {
  const theme = useComponentTheme('Drawer');

  const { rootAttrs: baseRootAttrs, rest } = composeRootAttrs(DrawerBase, props, theme);

  const { placement = DEFAULT_PLACEMENT, disabled = false, dismissable = true, children, ...sparProps } = rest;

  const rootAttrs = {
    ...baseRootAttrs,
    'data-placement': placement,
    'data-disabled': disabled ? '' : undefined,
    'data-dismissable': dismissable ? '' : undefined,
  };

  return (
    <DrawerProvider value={{ placement, dismissable }}>
      <SparDialog {...sparProps} disabled={disabled} forceMount {...rootAttrs}>
        {children}
      </SparDialog>
    </DrawerProvider>
  );
};

Drawer.displayName = 'Drawer';
