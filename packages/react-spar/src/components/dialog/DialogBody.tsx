import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogBodyBase } from './base';
import type { DialogBodyProps } from './types';

export const DialogBody = <T extends ElementType = 'div'>(props: DialogBodyProps<T>) => {
  const theme = useComponentTheme('DialogBody');

  const { rootAttrs, rest } = composeRootAttrs(DialogBodyBase, props as DialogBodyProps<'div'>, theme);

  const { as, children, ref, ...bodyProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...bodyProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DialogBody.displayName = 'Dialog.Body';
