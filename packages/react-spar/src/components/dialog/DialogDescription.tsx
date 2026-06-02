import type { ElementType } from 'react';
import { DialogDescription as SparDialogDescription } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogDescriptionBase } from './base';
import type { DialogDescriptionProps, DialogDescriptionSlot } from './types';

export const DialogDescription = <T extends ElementType = 'p'>(props: DialogDescriptionProps<T>) => {
  const theme = useComponentTheme('DialogDescription');

  const { rootAttrs, rest } = composeRootAttrs<DialogDescriptionProps, DialogDescriptionSlot>(DialogDescriptionBase, props as DialogDescriptionProps<'p'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDialogDescription {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogDescription>
  );
};

DialogDescription.displayName = 'Dialog.Description';
