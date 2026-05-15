import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioDescriptionBase } from './base';
import { useRadioItemOwnContext } from './context';
import type { RadioDescriptionProps } from './types';

export const RadioDescription = <T extends ElementType = 'span'>(props: RadioDescriptionProps<T>) => {
  useRadioItemOwnContext('Radio.Description');
  const theme = useComponentTheme('RadioDescription');

  const { rootAttrs, rest } = composeRootAttrs(RadioDescriptionBase, props as RadioDescriptionProps<'span'>, theme);
  const { children, ref, as, ...spar } = rest;

  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...spar} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

RadioDescription.displayName = 'Radio.Description';
