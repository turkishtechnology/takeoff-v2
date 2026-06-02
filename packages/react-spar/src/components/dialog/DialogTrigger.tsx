import type { ElementType } from 'react';
import { DialogTrigger as SparDialogTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogTriggerBase } from './base';
import type { DialogTriggerProps, DialogTriggerSlot } from './types';

export const DialogTrigger = <T extends ElementType = 'button'>(props: DialogTriggerProps<T>) => {
  const theme = useComponentTheme('DialogTrigger');

  const { rootAttrs, rest } = composeRootAttrs<DialogTriggerProps, DialogTriggerSlot>(DialogTriggerBase, props as DialogTriggerProps<'button'>, theme);
  const { children, ref, ...sparProps } = rest as DialogTriggerProps<'button'>;

  return (
    <SparDialogTrigger {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogTrigger>
  );
};

DialogTrigger.displayName = 'Dialog.Trigger';
