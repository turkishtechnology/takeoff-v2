import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardTitleBase } from './base';
import type { CardTitleProps, CardTitleSlot } from './types';

export const CardTitle = <T extends ElementType = 'h5'>(props: CardTitleProps<T>) => {
  const theme = useComponentTheme('CardTitle');

  const { rootAttrs, rest } = composeRootAttrs<CardTitleProps, CardTitleSlot>(CardTitleBase, props as CardTitleProps<'h5'>, theme, {
    // `data-level` reflects the rendered heading element, so emit it only when
    // `level` actually drives the element — i.e. when `as` is not overriding it.
    stateAttrs: ({ as, level = 5 }) => ({
      'data-level': as ? undefined : String(level),
    }),
  });

  const { as, level = 5, children, ref, ...titleProps } = rest;
  const Component = (as ?? `h${level}`) as ElementType;

  return (
    <Component {...titleProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

CardTitle.displayName = 'CardTitle';
