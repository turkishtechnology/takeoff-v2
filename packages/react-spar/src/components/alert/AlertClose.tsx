import type { ElementType, MouseEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertCloseBase } from './base';
import { useAlertContext } from './context';
import type { AlertCloseProps, AlertCloseSlot } from './types';

export const AlertClose = <T extends ElementType = 'button'>(props: AlertCloseProps<T>) => {
  const theme = useComponentTheme('AlertClose');
  const { onClose } = useAlertContext();

  const { rootAttrs, rest } = composeRootAttrs<AlertCloseProps, AlertCloseSlot>(AlertCloseBase, props as AlertCloseProps<'button'>, theme);

  const { as, children = 'Close', onClick, ref, type, ...closeProps } = rest;
  const Component = (as ?? 'button') as ElementType;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClose?.();
    onClick?.(event);
  };

  return (
    <Component {...closeProps} ref={ref} type={as ? type : (type ?? 'button')} onClick={handleClick} {...rootAttrs}>
      {children}
    </Component>
  );
};

AlertClose.displayName = 'Alert.Close';
