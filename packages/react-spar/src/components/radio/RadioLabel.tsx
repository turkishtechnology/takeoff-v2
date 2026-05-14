import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioLabelBase } from './base';
import { useRadioItemOwnContext } from './context';
import type { RadioLabelProps } from './types';

export const RadioLabel = <T extends ElementType = 'span'>(props: RadioLabelProps<T>) => {
  useRadioItemOwnContext('Radio.Label');
  const theme = useComponentTheme('RadioLabel');

  const { rootAttrs, rest } = composeRootAttrs(RadioLabelBase, props as RadioLabelProps<'span'>, theme);
  const { children, ref, as, ...spar } = rest;

  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...spar} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

RadioLabel.displayName = 'Radio.Label';
