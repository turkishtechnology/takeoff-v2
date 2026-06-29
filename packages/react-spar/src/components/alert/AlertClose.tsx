import type { ElementType, MouseEvent } from 'react';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { PlaceholderClose } from '../../icons';
import { useComponentTheme } from '../../provider';

import { AlertCloseBase } from './base';
import { useAlertContext } from './context';
import { DEFAULT_CLOSE_LABEL } from './defaults';
import type { AlertCloseProps, AlertCloseSlot } from './types';

export const AlertClose = <T extends ElementType = 'button'>(props: AlertCloseProps<T>) => {
  const theme = useComponentTheme('AlertClose');
  const { onClose } = useAlertContext('Alert.Close');

  const { rootAttrs, rest } = composeRootAttrs<AlertCloseProps, AlertCloseSlot>(AlertCloseBase, props as AlertCloseProps<'button'>, theme);

  const { as, children, onClick, ref, type, 'aria-label': ariaLabel, ...closeProps } = rest;
  const { onClick: slotOnClick, ...closeRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  const Component = (as ?? 'button') as ElementType;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // `onClose` is the component contract ("Called when Alert.Close is
    // clicked") and must fire unconditionally — a decorative `onClick`
    // (consumer prop or `slotProps.root`) calling `preventDefault` must not be
    // able to suppress dismissal. The composed `onClick`/`slotOnClick` run
    // first so their side effects (analytics, etc.) still observe the click.
    onClick?.(event);
    slotOnClick?.(event);
    onClose?.();
  };

  // Default to an icon-only control sized by the `.tk-alert-close` recipe.
  // An icon has no accessible name, so fall back to a default `aria-label`
  // when neither a custom label nor custom (text) children are supplied.
  const hasCustomChildren = isRenderableNode(children);

  return (
    <Component
      {...closeProps}
      ref={ref}
      type={as ? type : (type ?? 'button')}
      aria-label={ariaLabel ?? (hasCustomChildren ? undefined : DEFAULT_CLOSE_LABEL)}
      onClick={handleClick}
      {...closeRootAttrs}
    >
      {hasCustomChildren ? children : <PlaceholderClose />}
    </Component>
  );
};

AlertClose.displayName = 'Alert.Close';
