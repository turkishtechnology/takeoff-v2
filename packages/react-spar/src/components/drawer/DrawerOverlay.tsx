import type { ElementType } from 'react';
import { DialogOverlay as SparDialogOverlay } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerOverlayBase } from './base';
import { DEFAULT_INTENSITY } from './defaults';
import type { DrawerOverlayProps } from './types';

export const DrawerOverlay = <T extends ElementType = 'div'>(props: DrawerOverlayProps<T>) => {
  const theme = useComponentTheme('DrawerOverlay');

  const { rootAttrs, rest } = composeRootAttrs(DrawerOverlayBase, props as DrawerOverlayProps<'div'>, theme);

  const { intensity = DEFAULT_INTENSITY, invisible = false, children, ref, ...overlayProps } = rest;

  const finalRootAttrs = {
    ...rootAttrs,
    'data-intensity': intensity,
    'data-invisible': invisible ? '' : undefined,
  };

  return (
    <SparDialogOverlay {...overlayProps} ref={ref} {...finalRootAttrs}>
      {children}
    </SparDialogOverlay>
  );
};

DrawerOverlay.displayName = 'DrawerOverlay';
