import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogFooterBase } from './base';
import type { DialogFooterProps, DialogFooterSlot } from './types';

export const DialogFooter = <T extends ElementType = 'div'>(props: DialogFooterProps<T>) => {
  const theme = useComponentTheme('DialogFooter');

  const { rootAttrs, rest } = composeRootAttrs<DialogFooterProps, DialogFooterSlot>(DialogFooterBase, props as DialogFooterProps<'div'>, theme);

  const { as, children, ref, ...footerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...footerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DialogFooter.displayName = 'Dialog.Footer';
