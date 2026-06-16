import type { ElementType } from 'react';
import { FieldLabel as SparFieldLabel, useFieldContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FieldLabelBase } from './base';
import type { FieldLabelProps, FieldLabelSlot } from './types';

export const FieldLabel = <T extends ElementType = 'label'>(props: FieldLabelProps<T>) => {
  const theme = useComponentTheme('FieldLabel');
  // The required asterisk is a wrapper-owned convention (not a Spar concern),
  // so we read `required` off Spar's FieldContext and emit `.tk-field-asterisk`
  // inline. Keeping it auto-rendered keeps Field's required UX in line with
  // the rest of the form-control label conventions.
  const { required } = useFieldContext();

  const { rootAttrs, rest } = composeRootAttrs(FieldLabelBase, props as FieldLabelProps<'label'>, theme);

  const { children, ref, ...spar } = rest;

  const asteriskAttrs = buildSlotAttrs(FieldLabelBase.getSlotProps('asterisk'), 'asterisk' as FieldLabelSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <SparFieldLabel {...spar} ref={ref} {...rootAttrs}>
      {children}
      {required && (
        <span {...asteriskAttrs} aria-hidden="true">
          *
        </span>
      )}
    </SparFieldLabel>
  );
};

FieldLabel.displayName = 'Field.Label';
