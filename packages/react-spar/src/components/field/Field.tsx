import type { ElementType } from 'react';
import { Field as SparField, type FieldProps as SparFieldProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FieldBase } from './base';
import type { FieldProps } from './types';

export const Field = <T extends ElementType = 'div'>(props: FieldProps<T>) => {
  const theme = useComponentTheme('Field');

  // `data-invalid`, `data-disabled`, `data-required`, `data-readonly` are NOT
  // emitted here — Spar's Field root already sets them on the root element.
  const { rootAttrs, rest } = composeRootAttrs(FieldBase, props as FieldProps<'div'>, theme);

  const { children, ref, ...sparProps } = rest;

  return (
    <SparField {...(sparProps as unknown as SparFieldProps)} ref={ref} {...rootAttrs}>
      {children}
    </SparField>
  );
};

Field.displayName = 'Field';
