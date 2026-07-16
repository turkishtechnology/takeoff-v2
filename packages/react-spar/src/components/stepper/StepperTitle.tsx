import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { StepperTitleBase } from './base';
import { useStepperContext } from './context';
import type { StepperTitleProps } from './types';

export const StepperTitle = <T extends ElementType = 'span'>(props: StepperTitleProps<T>) => {
  const theme = useComponentTheme('StepperTitle');
  // Consumed for the safe-context boundary only — the title is styled
  // through the root's cascading data-* hooks.
  useStepperContext('Stepper.Title');

  const { rootAttrs, rest } = composeRootAttrs(StepperTitleBase, props as StepperTitleProps<'span'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

StepperTitle.displayName = 'Stepper.Title';
