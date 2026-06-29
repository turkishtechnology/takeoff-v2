import type { ElementType } from 'react';
import { DialogOverlay as SparDialogOverlay } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogOverlayBase } from './base';
import { DEFAULT_INTENSITY } from './defaults';
import type { DialogOverlayProps, DialogOverlaySlot } from './types';

export const DialogOverlay = <T extends ElementType = 'div'>(props: DialogOverlayProps<T>) => {
  const theme = useComponentTheme('DialogOverlay');

  const { rootAttrs, rest } = composeRootAttrs<DialogOverlayProps, DialogOverlaySlot>(DialogOverlayBase, props as DialogOverlayProps<'div'>, theme, {
    stateAttrs: ({ intensity = DEFAULT_INTENSITY, invisible, blur }) => ({
      'data-intensity': intensity,
      'data-invisible': invisible ? '' : undefined,
      'data-blur': blur ? '' : undefined,
    }),
  });

  const { intensity: _intensity, invisible: _invisible, blur: _blur, children, ref, ...sparProps } = rest;

  return (
    <SparDialogOverlay {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogOverlay>
  );
};

DialogOverlay.displayName = 'Dialog.Overlay';
