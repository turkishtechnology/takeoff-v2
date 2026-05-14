import type { ElementType } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputContainerBase } from './base';
import type { InputContainerProps } from './types';

export const InputContainer = <T extends ElementType = 'div'>(props: InputContainerProps<T>) => {
  const theme = useComponentTheme('InputContainer');
  // Container mirrors Spar's Input root state onto its own element so the
  // bordered row can style hover/focus/invalid/disabled/readonly without
  // crawling up the DOM. Spar's own `data-*` lives on the outer `.tk-input`
  // root, but the visual container is one level in.
  const { isInvalid, disabled, readOnly } = useInputContext();

  const Component = (props.as ?? 'div') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputContainerBase, props as InputContainerProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-invalid': isInvalid ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-readonly': readOnly ? '' : undefined,
    }),
  });

  const { as: _as, children, ref, ...rendered } = rest;

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

InputContainer.displayName = 'Input.Container';
