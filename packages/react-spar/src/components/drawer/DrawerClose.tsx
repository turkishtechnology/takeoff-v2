import type { ElementType } from 'react';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerCloseBase } from './base';
import { DEFAULT_CLOSE_LABEL } from './defaults';
import type { DrawerCloseProps } from './types';

export const DrawerClose = <T extends ElementType = 'button'>(props: DrawerCloseProps<T>) => {
  const theme = useComponentTheme('DrawerClose');

  const { rootAttrs, rest } = composeRootAttrs(DrawerCloseBase, props as DrawerCloseProps<'button'>, theme);

  const { children, ref, 'aria-label': ariaLabel, ...closeProps } = rest;

  // Mirrors Alert.Close: default to an icon-only control so every close
  // affordance in the library renders the same official glyph. An icon has no
  // accessible name, so fall back to a default `aria-label` when neither a
  // custom label nor custom children are supplied. `children` also accepts
  // Spar's render-prop form, which is always custom content.
  const hasCustomChildren = typeof children === 'function' || isRenderableNode(children);

  return (
    <SparDialogClose {...closeProps} aria-label={ariaLabel ?? (hasCustomChildren ? undefined : DEFAULT_CLOSE_LABEL)} ref={ref} {...rootAttrs}>
      {hasCustomChildren ? children : <CloseIconOutlinedRounded />}
    </SparDialogClose>
  );
};

DrawerClose.displayName = 'Drawer.Close';
