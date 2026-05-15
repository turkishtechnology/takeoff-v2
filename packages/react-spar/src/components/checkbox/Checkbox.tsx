import type { ElementType } from 'react';
import {
  Checkbox as SparCheckbox,
  type CheckboxProps as SparCheckboxProps,
  type CheckboxRenderProps as SparCheckboxRenderProps,
  type CheckedState,
} from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { CheckboxProvider } from './context';
import { DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { CheckboxProps, CheckboxSlot } from './types';

export const Checkbox = <T extends ElementType = 'span'>(props: CheckboxProps<T>) => {
  const theme = useComponentTheme('Checkbox');

  // `data-checked`, `data-indeterminate`, `data-disabled`, `data-readonly`,
  // `data-focus`, `data-hover`, `data-active`, `data-required`, `data-invalid`
  // are NOT layered here — Spar's Checkbox already emits them on this element
  // with the same semantics, and duplication is exactly what
  // `data-attribute-vocabulary.md` rule 7 forbids. takeoff-spar owns the
  // Takeoff visual vocabulary only.
  const { rootAttrs, rest } = composeRootAttrs<CheckboxProps, CheckboxSlot>(CheckboxBase, props as CheckboxProps<'span'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, type = DEFAULT_TYPE }) => ({
      'data-size': size,
      'data-type': type,
    }),
  });

  // `classNames` / `slotProps` are stripped from `rest` by `composeRootAttrs`,
  // so read them off the original props to forward to the sub-component
  // context.
  const { classNames, slotProps } = props as CheckboxProps<'span'>;

  const {
    // Visual props are consumed via `stateAttrs`; destructured to keep them
    // off the rendered DOM where they would leak as raw HTML attributes.
    size: _size,
    type: _type,
    // `invalid` is forwarded to Spar as `isInvalid`.
    invalid = false,
    // takeoff-spar tri-state vocabulary; mapped to Spar's `CheckedState` below.
    checked,
    defaultChecked,
    indeterminate = false,
    onChange,
    // Behavior props owned by Spar — defaults are restated here so they also
    // flow into the context for compound sub-components (asterisk on Label).
    disabled = false,
    readOnly = false,
    required = false,
    children,
    ref,
    ...sparProps
  } = rest;

  // `indeterminate` wins over `checked` / `defaultChecked` per
  // `packages/react-spar/docs/coding-standards.md` line 209. The mapping is
  // inline — a pure shape translation, not an adapter hook.
  const sparChecked: CheckedState | undefined = indeterminate ? 'indeterminate' : checked;
  const sparDefaultChecked: CheckedState | undefined = indeterminate ? 'indeterminate' : defaultChecked;

  // Spar's user-toggle path always transitions to `true | false` (never
  // re-emits `'indeterminate'`), so flattening the callback signature to
  // boolean is safe. The strict cast keeps the public API simple.
  const handleSparChange = onChange ? (next: CheckedState) => onChange(next === true) : undefined;

  return (
    <SparCheckbox
      {...(sparProps as unknown as SparCheckboxProps)}
      checked={sparChecked}
      defaultChecked={sparDefaultChecked}
      onChange={handleSparChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      isInvalid={invalid}
      ref={ref}
      {...rootAttrs}
    >
      {(state: SparCheckboxRenderProps) => (
        <CheckboxProvider
          value={{
            classNames,
            slotProps,
            required,
            invalid,
            disabled: state.disabled,
            readOnly: state.readOnly,
            checked: state.checked === true,
            indeterminate: state.checked === 'indeterminate',
          }}
        >
          {typeof children === 'function' ? children(state) : children}
        </CheckboxProvider>
      )}
    </SparCheckbox>
  );
};

Checkbox.displayName = 'Checkbox';
