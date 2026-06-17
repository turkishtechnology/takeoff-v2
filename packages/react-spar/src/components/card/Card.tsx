import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardBase } from './base';
import type { CardProps, CardSlot } from './types';

export const Card = <T extends ElementType = 'div'>(props: CardProps<T>) => {
  const theme = useComponentTheme('Card');

  const { rootAttrs, rest } = composeRootAttrs<CardProps, CardSlot>(CardBase, props as CardProps<'div'>, theme);

  const { as, children, ref, ...cardProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...cardProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

Card.displayName = 'Card';
