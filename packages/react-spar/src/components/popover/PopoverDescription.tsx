import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PopoverDescriptionBase } from './base';
import type { PopoverDescriptionProps, PopoverDescriptionSlot } from './types';

export const PopoverDescription = <T extends ElementType = 'p'>(props: PopoverDescriptionProps<T>) => {
  const theme = useComponentTheme('PopoverDescription');

  const { rootAttrs, rest } = composeRootAttrs<PopoverDescriptionProps, PopoverDescriptionSlot>(PopoverDescriptionBase, props as PopoverDescriptionProps<'p'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

PopoverDescription.displayName = 'Popover.Description';
