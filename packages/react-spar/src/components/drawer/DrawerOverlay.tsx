import type { ElementType } from 'react';
import { DialogOverlay as SparDialogOverlay } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerOverlayBase } from './base';
import { DEFAULT_INTENSITY } from './defaults';
import type { DrawerOverlayProps } from './types';

export const DrawerOverlay = <T extends ElementType = 'div'>(props: DrawerOverlayProps<T>) => {
  const theme = useComponentTheme('DrawerOverlay');

  const { rootAttrs, rest } = composeRootAttrs(DrawerOverlayBase, props as DrawerOverlayProps<'div'>, theme, {
    stateAttrs: ({ intensity = DEFAULT_INTENSITY, invisible }) => ({
      'data-intensity': intensity,
      'data-invisible': invisible ? '' : undefined,
    }),
  });

  const { intensity: _intensity, invisible: _invisible, children, ref, ...overlayProps } = rest;

  return (
    <SparDialogOverlay {...overlayProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogOverlay>
  );
};

DrawerOverlay.displayName = 'DrawerOverlay';
