import type { ElementType, MouseEvent } from 'react';

import { composeRootAttrs } from '../../core';
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
    onClick?.(event);
    slotOnClick?.(event);
    if (event.defaultPrevented) return;
    onClose?.();
  };

  // Default to an icon-only control sized by the `.tk-alert-close` recipe.
  // An icon has no accessible name, so fall back to a default `aria-label`
  // when neither a custom label nor custom (text) children are supplied.
  const hasCustomChildren = children != null;

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
