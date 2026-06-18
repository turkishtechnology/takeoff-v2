import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputStepperBase } from './base';
import { useInputOwnContext } from './context';
import type { InputStepperProps } from './types';

export const InputStepper = <T extends ElementType = 'div'>(props: InputStepperProps<T>) => {
  const theme = useComponentTheme('InputStepper');
  useInputOwnContext('Input.Stepper');
  const Component = (props.as ?? 'div') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputStepperBase, props as InputStepperProps<'div'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

InputStepper.displayName = 'Input.Stepper';
