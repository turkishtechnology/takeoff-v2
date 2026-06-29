import type { ElementType } from 'react';
import { Toast as SparToast } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Alert } from '../alert';
import { Button } from '../button';

import { ToastBase } from './base';
import { DEFAULT_CLOSE_LABEL, DEFAULT_TOAST_APPEARANCE } from './defaults';
import type { ToastProps, ToastSlot } from './types';
import { toastTypeToVariant } from './utils';

export const Toast = <T extends ElementType = 'div'>(props: ToastProps<T>) => {
  const theme = useComponentTheme('Toast');

  // Spar's Toast.Root already emits `data-status`/`data-type` from the same
  // `toast` object (after spreading incoming props), so no `stateAttrs` are
  // layered here — they would be dead, always-overwritten attributes.
  const { rootAttrs, rest } = composeRootAttrs<ToastProps, ToastSlot>(ToastBase, props as ToastProps<'div'>, theme);

  const { as, toast, toaster, appearance = DEFAULT_TOAST_APPEARANCE, closeLabel = DEFAULT_CLOSE_LABEL, children, ref, ...toastProps } = rest;
  const Component = (as ?? 'div') as ElementType;
  const variant = toastTypeToVariant(toast.type);

  return (
    <SparToast.Root {...toastProps} as={Component} ref={ref} toast={toast} toaster={toaster} {...rootAttrs}>
      {children ?? (
        <Alert variant={variant} appearance={appearance} role="presentation">
          <Alert.Content>
            {toast.title != null && <SparToast.Title as={Alert.Title}>{toast.title}</SparToast.Title>}
            {toast.description != null && <SparToast.Description as={Alert.Description}>{toast.description}</SparToast.Description>}
          </Alert.Content>
          <SparToast.Close as={Alert.Close} aria-label={closeLabel} />
          {toast.action && (
            <Alert.Actions>
              <SparToast.Action as={Button} className="tk-alert-action" variant={variant} appearance="text" size="small" />
            </Alert.Actions>
          )}
        </Alert>
      )}
    </SparToast.Root>
  );
};

Toast.displayName = 'Toast';
