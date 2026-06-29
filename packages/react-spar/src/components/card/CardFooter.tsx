import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CardFooterBase } from './base';
import { DEFAULT_FOOTER_TYPE } from './defaults';
import type { CardFooterProps, CardFooterSlot } from './types';

export const CardFooter = <T extends ElementType = 'div'>(props: CardFooterProps<T>) => {
  const theme = useComponentTheme('CardFooter');

  const { rootAttrs, rest } = composeRootAttrs<CardFooterProps, CardFooterSlot>(CardFooterBase, props as CardFooterProps<'div'>, theme, {
    stateAttrs: ({ footerType = DEFAULT_FOOTER_TYPE }) => ({
      'data-footer-type': footerType,
    }),
  });

  const { as, footerType: _footerType, children, ref, ...footerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...footerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

CardFooter.displayName = 'CardFooter';
