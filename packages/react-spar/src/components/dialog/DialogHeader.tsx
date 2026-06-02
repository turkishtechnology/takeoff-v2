import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogHeaderBase } from './base';
import { DEFAULT_HEADER_TYPE } from './defaults';
import type { DialogHeaderProps, DialogHeaderSlot } from './types';

export const DialogHeader = <T extends ElementType = 'div'>(props: DialogHeaderProps<T>) => {
  const theme = useComponentTheme('DialogHeader');

  const { rootAttrs, rest } = composeRootAttrs<DialogHeaderProps, DialogHeaderSlot>(DialogHeaderBase, props as DialogHeaderProps<'div'>, theme, {
    stateAttrs: ({ headerType = DEFAULT_HEADER_TYPE }) => ({
      'data-header-type': headerType,
    }),
  });

  const { as, headerType = DEFAULT_HEADER_TYPE, children, ref, ...headerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  const headerClassName = [rootAttrs.className, `tk-dialog-header-${headerType}`].filter(Boolean).join(' ');

  return (
    <Component {...headerProps} ref={ref} {...rootAttrs} className={headerClassName}>
      {children}
    </Component>
  );
};

DialogHeader.displayName = 'Dialog.Header';
