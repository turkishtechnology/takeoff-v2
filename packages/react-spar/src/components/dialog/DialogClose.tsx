import type { ElementType } from 'react';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogCloseBase } from './base';
import { DEFAULT_CLOSE_LABEL } from './defaults';
import type { DialogCloseProps, DialogCloseSlot } from './types';

export const DialogClose = <T extends ElementType = 'button'>(props: DialogCloseProps<T>) => {
  const theme = useComponentTheme('DialogClose');

  const { rootAttrs, rest } = composeRootAttrs<DialogCloseProps, DialogCloseSlot>(DialogCloseBase, props as DialogCloseProps<'button'>, theme);
  const { children, ref, 'aria-label': ariaLabel, ...sparProps } = rest;

  // Mirrors Alert.Close: default to an icon-only control so every close
  // affordance in the library renders the same official glyph. An icon has no
  // accessible name, so fall back to a default `aria-label` when neither a
  // custom label nor custom children are supplied. `children` also accepts
  // Spar's render-prop form, which is always custom content.
  const hasCustomChildren = typeof children === 'function' || isRenderableNode(children);

  return (
    <SparDialogClose {...sparProps} aria-label={ariaLabel ?? (hasCustomChildren ? undefined : DEFAULT_CLOSE_LABEL)} {...rootAttrs} ref={ref}>
      {hasCustomChildren ? children : <CloseIconOutlinedRounded />}
    </SparDialogClose>
  );
};

DialogClose.displayName = 'Dialog.Close';
