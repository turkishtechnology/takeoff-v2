import { useEffect, useId, type ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { StepperDescriptionBase } from './base';
import { useStepperItem } from './context';
import type { StepperDescriptionProps } from './types';

export const StepperDescription = <T extends ElementType = 'span'>(props: StepperDescriptionProps<T>) => {
  const theme = useComponentTheme('StepperDescription');
  const { registerDescription } = useStepperItem('Stepper.Description');

  const { rootAttrs, rest } = composeRootAttrs(StepperDescriptionBase, props as StepperDescriptionProps<'span'>, theme);
  const { as, children, ref, id: idProp, ...nativeProps } = rest;

  const autoId = useId();
  const id = idProp ?? autoId;
  useEffect(() => registerDescription(id), [registerDescription, id]);

  const Component = (as ?? 'span') as ElementType;

  return (
    // Locked after the spread: the id must match the trigger's
    // `aria-describedby` registration, and `aria-hidden` keeps the description
    // out of the trigger's accessible NAME — it still reaches assistive
    // technology as the trigger's description, since `aria-describedby` may
    // reference hidden elements.
    <Component {...nativeProps} {...rootAttrs} ref={ref} id={id} aria-hidden="true">
      {children}
    </Component>
  );
};

StepperDescription.displayName = 'Stepper.Description';
