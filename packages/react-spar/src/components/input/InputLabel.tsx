import type { ElementType } from 'react';
import { InputLabel as SparInputLabel, useInputContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputLabelBase } from './base';
import type { InputLabelProps, InputLabelSlot } from './types';

export const InputLabel = <T extends ElementType = 'label'>(props: InputLabelProps<T>) => {
  const theme = useComponentTheme('InputLabel');
  // The required asterisk is a wrapper-owned convention (not a Spar concern),
  // so we read `required` off Spar's InputContext and emit `.tk-input-asterisk`
  // inline. Keeping it auto-rendered ensures parity with the legacy
  // `showAsterisk` UX without exposing yet another consumer prop.
  const { required } = useInputContext();

  const { rootAttrs, rest } = composeRootAttrs(InputLabelBase, props as InputLabelProps<'label'>, theme);

  const { children, ref, ...spar } = rest;

  const asteriskAttrs = buildSlotAttrs(InputLabelBase.getSlotProps('asterisk'), 'asterisk' as InputLabelSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <SparInputLabel {...spar} ref={ref} {...rootAttrs}>
      {children}
      {required && (
        <span {...asteriskAttrs} aria-hidden="true">
          *
        </span>
      )}
    </SparInputLabel>
  );
};

InputLabel.displayName = 'Input.Label';
