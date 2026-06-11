import type { ElementType } from 'react';
import { Label as SparLabel, type LabelProps as SparLabelProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { LabelBase } from './base';
import type { LabelProps, LabelSlot } from './types';

export const Label = <T extends ElementType = 'label'>(props: LabelProps<T>) => {
  const theme = useComponentTheme('Label');

  const { rootAttrs, rest } = composeRootAttrs<LabelProps<'label'>, LabelSlot>(LabelBase, props as LabelProps<'label'>, theme);

  const { as, children, ref, ...sparProps } = rest;

  return (
    <SparLabel {...(sparProps as unknown as SparLabelProps<'label'>)} as={as} ref={ref} {...rootAttrs}>
      {children}
    </SparLabel>
  );
};

Label.displayName = 'Label';
