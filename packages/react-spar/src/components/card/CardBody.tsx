import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardBodyBase } from './base';
import type { CardBodyProps, CardBodySlot } from './types';

export const CardBody = <T extends ElementType = 'div'>(props: CardBodyProps<T>) => {
  const theme = useComponentTheme('CardBody');

  const { rootAttrs, rest } = composeRootAttrs<CardBodyProps, CardBodySlot>(CardBodyBase, props as CardBodyProps<'div'>, theme);

  const { as, children, ref, ...bodyProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...bodyProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

CardBody.displayName = 'CardBody';
