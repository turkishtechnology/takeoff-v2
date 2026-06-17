import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogFooterBase } from './base';
import { DEFAULT_FOOTER_TYPE } from './defaults';
import type { DialogFooterProps, DialogFooterSlot } from './types';

export const DialogFooter = <T extends ElementType = 'div'>(props: DialogFooterProps<T>) => {
  const theme = useComponentTheme('DialogFooter');

  const { rootAttrs, rest } = composeRootAttrs<DialogFooterProps, DialogFooterSlot>(DialogFooterBase, props as DialogFooterProps<'div'>, theme, {
    stateAttrs: ({ footerType = DEFAULT_FOOTER_TYPE }) => ({
      'data-footer-type': footerType,
    }),
  });

  const { as, footerType: _footerType, children, ref, ...footerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...footerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DialogFooter.displayName = 'Dialog.Footer';
