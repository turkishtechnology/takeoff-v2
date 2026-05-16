import type { ElementType } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputContainerBase } from './base';
import type { InputContainerProps, InputContainerSlot } from './types';

export const InputContainer = <T extends ElementType = 'div'>(props: InputContainerProps<T>) => {
  const theme = useComponentTheme('InputContainer');
  // Container mirrors Spar's Input root state onto its own element so the
  // bordered row can style hover/focus/invalid/disabled/readonly without
  // crawling up the DOM. Spar's own `data-*` lives on the outer `.tk-input`
  // root, but the visual container is one level in.
  const { invalid, disabled, readOnly } = useInputContext();

  const Component = (props.as ?? 'div') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(InputContainerBase, props as InputContainerProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-invalid': invalid ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-readonly': readOnly ? '' : undefined,
    }),
  });

  const { as: _as, children, startContent, endContent, ref, ...rendered } = rest;

  const slotAttrs = (slot: InputContainerSlot) =>
    buildSlotAttrs(InputContainerBase.getSlotProps(slot), slot, {
      themeSlotProps: theme?.slotProps,
      themeClassNames: theme?.classNames,
      instanceSlotProps: props.slotProps,
      instanceClassNames: props.classNames,
    });

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {startContent != null && (
        <span aria-hidden="true" {...slotAttrs('startContent')}>
          {startContent}
        </span>
      )}
      {children}
      {endContent != null && (
        <span aria-hidden="true" {...slotAttrs('endContent')}>
          {endContent}
        </span>
      )}
    </Component>
  );
};

InputContainer.displayName = 'Input.Container';
