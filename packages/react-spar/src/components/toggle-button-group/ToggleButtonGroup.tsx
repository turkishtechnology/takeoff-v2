import type { ElementType } from 'react';
import { ToggleGroup as SparToggleGroup } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ToggleButtonGroupBase } from './base';
import { ToggleButtonGroupProvider } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_TYPE, DEFAULT_VARIANT } from './defaults';
import type { ToggleButtonGroupProps } from './types';

export const ToggleButtonGroup = <T extends ElementType = 'div'>(props: ToggleButtonGroupProps<T>) => {
  const theme = useComponentTheme('ToggleButtonGroup');

  // Spar emits `data-orientation` / `data-disabled` / `data-multiple` on the
  // group itself; only the Takeoff visual hooks are layered here.
  const { rootAttrs, rest } = composeRootAttrs(ToggleButtonGroupBase, props as ToggleButtonGroupProps<'div'>, theme, {
    stateAttrs: ({ type = DEFAULT_TYPE, size = DEFAULT_SIZE, rounded }) => ({
      'data-type': type,
      'data-size': size,
      'data-rounded': rounded ? '' : undefined,
    }),
  });

  const {
    // Consumed by `stateAttrs`; kept off the DOM.
    type: _type,
    rounded: _rounded,
    size = DEFAULT_SIZE,
    variant = DEFAULT_VARIANT,
    appearance = DEFAULT_APPEARANCE,
    children,
    ref,
    ...sparProps
  } = rest;

  return (
    <ToggleButtonGroupProvider value={{ size, variant, appearance }}>
      <SparToggleGroup {...sparProps} {...rootAttrs} ref={ref}>
        {children}
      </SparToggleGroup>
    </ToggleButtonGroupProvider>
  );
};

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
