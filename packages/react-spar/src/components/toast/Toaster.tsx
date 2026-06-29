import { Fragment, type ElementType } from 'react';
import { Toaster as SparToaster } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ToasterBase } from './base';
import { DEFAULT_CLOSE_LABEL, DEFAULT_TOAST_APPEARANCE } from './defaults';
import { Toast } from './Toast';
import type { ToastData, ToasterProps, ToasterSlot } from './types';

export const Toaster = <T extends ElementType = 'div'>(props: ToasterProps<T>) => {
  const theme = useComponentTheme('Toaster');

  const { rootAttrs, rest } = composeRootAttrs<ToasterProps, ToasterSlot>(ToasterBase, props as ToasterProps<'div'>, theme, {
    stateAttrs: ({ toaster }) => ({
      'data-placement': toaster.placement,
    }),
  });

  const { as, toaster, appearance = DEFAULT_TOAST_APPEARANCE, closeLabel = DEFAULT_CLOSE_LABEL, overlap = false, children, ref, ...toasterProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <SparToaster {...toasterProps} as={Component} ref={ref} toaster={toaster} overlap={overlap} {...rootAttrs}>
      {(toast: ToastData) =>
        // Spar renders each item directly into a mapped array, so the key must
        // live on the element this render prop returns. The default branch keys
        // <Toast>; a consumer `children` result is keyed via Fragment here.
        children ? <Fragment key={toast.id}>{children(toast)}</Fragment> : <Toast key={toast.id} toast={toast} toaster={toaster} appearance={appearance} closeLabel={closeLabel} />
      }
    </SparToaster>
  );
};

Toaster.displayName = 'Toaster';
