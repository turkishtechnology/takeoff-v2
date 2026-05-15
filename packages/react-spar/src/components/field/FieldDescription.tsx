import type { ElementType } from 'react';
import { FieldDescription as SparFieldDescription } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FieldDescriptionBase } from './base';
import type { FieldDescriptionProps } from './types';

export const FieldDescription = <T extends ElementType = 'div'>(props: FieldDescriptionProps<T>) => {
  const theme = useComponentTheme('FieldDescription');

  const { rootAttrs, rest } = composeRootAttrs(FieldDescriptionBase, props as FieldDescriptionProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  return (
    <SparFieldDescription {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparFieldDescription>
  );
};

FieldDescription.displayName = 'Field.Description';
