import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertBase } from './base';
import { AlertProvider } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_VARIANT } from './defaults';
import type { AlertProps, AlertSlot } from './types';

export const Alert = <T extends ElementType = 'div'>(props: AlertProps<T>) => {
  const theme = useComponentTheme('Alert');

  const { rootAttrs, rest } = composeRootAttrs<AlertProps, AlertSlot>(AlertBase, props as AlertProps<'div'>, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE }) => ({
      'data-variant': variant,
      'data-type': appearance,
    }),
  });

  // `role="status"` (polite live region) is the safer default: most alerts are
  // present on initial render, where `role="alert"`'s assertive announcement is
  // both unnecessary and noisy on re-render. Consumers surfacing a genuinely
  // urgent, dynamically-inserted message can pass `role="alert"`.
  const { as, variant: _variant, appearance: _appearance, onClose, children, ref, role = 'status', ...alertProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <AlertProvider value={{ onClose }}>
      <Component {...alertProps} ref={ref} role={role} {...rootAttrs}>
        {children}
      </Component>
    </AlertProvider>
  );
};

Alert.displayName = 'Alert';
