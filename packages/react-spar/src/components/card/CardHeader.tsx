import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardHeaderBase } from './base';
import { DEFAULT_HEADER_TYPE } from './defaults';
import type { CardHeaderProps, CardHeaderSlot } from './types';

export const CardHeader = <T extends ElementType = 'div'>(props: CardHeaderProps<T>) => {
  const theme = useComponentTheme('CardHeader');

  const { rootAttrs, rest } = composeRootAttrs<CardHeaderProps, CardHeaderSlot>(CardHeaderBase, props as CardHeaderProps<'div'>, theme, {
    stateAttrs: ({ headerType = DEFAULT_HEADER_TYPE }) => ({
      'data-header-type': headerType,
    }),
  });

  const { as, headerType: _headerType, children, ref, ...headerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...headerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

CardHeader.displayName = 'CardHeader';
