import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioTextBase } from './base';
import { useRadioItemOwnContext } from './context';
import type { RadioTextProps } from './types';

export const RadioText = <T extends ElementType = 'span'>(props: RadioTextProps<T>) => {
  useRadioItemOwnContext('Radio.Text');
  const theme = useComponentTheme('RadioText');

  const { rootAttrs, rest } = composeRootAttrs(RadioTextBase, props as RadioTextProps<'span'>, theme);
  const { children, ref, as, ...spar } = rest;

  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...spar} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

RadioText.displayName = 'Radio.Text';
