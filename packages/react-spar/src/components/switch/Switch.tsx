import type { ElementType } from 'react';
import {
  Switch as SparSwitch,
  type SwitchProps as SparSwitchProps,
  type SwitchRenderProps as SparSwitchRenderProps,
} from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { SwitchProvider } from './context';
import { DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { SwitchProps, SwitchSlot } from './types';

export const Switch = <T extends ElementType = 'button'>(props: SwitchProps<T>) => {
  const theme = useComponentTheme('Switch');

  // `data-state`, `data-checked`, `data-disabled`, `data-readonly`,
  // `data-required`, `data-invalid`, `data-focus`, `data-hover`, `data-active`
  // are NOT layered here — Spar's Switch already emits them on this element
  // with the same semantics, and duplication is exactly what
  // `data-attribute-vocabulary.md` rule 7 forbids. takeoff-spar owns the
  // Takeoff visual vocabulary only (`data-size`, `data-variant`).
  const { rootAttrs, rest } = composeRootAttrs<SwitchProps, SwitchSlot>(SwitchBase, props as SwitchProps<'button'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, variant = DEFAULT_VARIANT }) => ({
      'data-size': size,
      'data-variant': variant,
    }),
  });

  // `classNames` / `slotProps` are stripped from `rest` by `composeRootAttrs`,
  // so read them off the original props to forward to the sub-component
  // context.
  const { classNames, slotProps } = props as SwitchProps<'button'>;

  const {
    // Visual props are consumed via `stateAttrs`; destructured to keep them
    // off the rendered DOM where they would leak as raw HTML attributes.
    size: _size,
    variant: _variant,
    // `invalid` is forwarded to Spar as `isInvalid`.
    invalid = false,
    children,
    ref,
    ...sparProps
  } = rest;

  return (
    <SparSwitch
      {...(sparProps as unknown as SparSwitchProps)}
      isInvalid={invalid}
      ref={ref}
      {...rootAttrs}
    >
      {(state: SparSwitchRenderProps) => (
        <SwitchProvider
          value={{
            classNames,
            slotProps,
            checked: state.checked,
            disabled: state.disabled,
            readOnly: state.readOnly,
          }}
        >
          {typeof children === 'function' ? children(state) : children}
        </SwitchProvider>
      )}
    </SparSwitch>
  );
};

Switch.displayName = 'Switch';
