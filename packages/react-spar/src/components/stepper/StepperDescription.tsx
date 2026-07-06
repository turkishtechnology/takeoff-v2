import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { StepperDescriptionBase } from './base';
import { useStepperContext } from './context';
import type { StepperDescriptionProps } from './types';

export const StepperDescription = <T extends ElementType = 'span'>(props: StepperDescriptionProps<T>) => {
  const theme = useComponentTheme('StepperDescription');
  // Consumed for the safe-context boundary only — the description is styled
  // through the root's cascading data-* hooks.
  useStepperContext('Stepper.Description');

  const { rootAttrs, rest } = composeRootAttrs(StepperDescriptionBase, props as StepperDescriptionProps<'span'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

StepperDescription.displayName = 'Stepper.Description';
