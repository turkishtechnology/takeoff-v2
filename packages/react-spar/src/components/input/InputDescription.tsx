import type { ElementType } from 'react';
import { InputDescription as SparInputDescription } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputDescriptionBase } from './base';
import type { InputDescriptionProps } from './types';

export const InputDescription = <T extends ElementType = 'div'>(props: InputDescriptionProps<T>) => {
  const theme = useComponentTheme('InputDescription');

  const { rootAttrs, rest } = composeRootAttrs(InputDescriptionBase, props as InputDescriptionProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparInputDescription {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparInputDescription>
  );
};

InputDescription.displayName = 'Input.Description';
