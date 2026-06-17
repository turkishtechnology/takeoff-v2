import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardDescriptionBase } from './base';
import type { CardDescriptionProps, CardDescriptionSlot } from './types';

export const CardDescription = <T extends ElementType = 'p'>(props: CardDescriptionProps<T>) => {
  const theme = useComponentTheme('CardDescription');

  const { rootAttrs, rest } = composeRootAttrs<CardDescriptionProps, CardDescriptionSlot>(CardDescriptionBase, props as CardDescriptionProps<'p'>, theme);

  const { as, children, ref, ...descriptionProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...descriptionProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

CardDescription.displayName = 'CardDescription';
