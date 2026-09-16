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
import { DEFAULT_SIZE } from './defaults';
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
    stateAttrs: ({ size = DEFAULT_SIZE }) => ({
      'data-size': size,
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
    // takeoff-spar narrows `checked` / `defaultChecked` to `boolean` and
    // flattens `onChange`; `indeterminate` is Spar's own prop and passes through.
    checked,
    defaultChecked,
    indeterminate,
    onChange,
    children,
    ref,
    // `invalid`, `disabled`, `readOnly` and `required` are intentionally NOT
    // destructured (so no eager `= false` default is applied) — they flow to
    // Spar via `...sparProps` untouched. Defaulting them here would turn an
    // omitted prop into an explicit `false`, defeating Spar's
    // `prop ?? fieldCtx?.x` inheritance and silently overriding a wrapping
    // `<Field disabled>`. Their resolved values are read back off Spar's
    // render-prop `state` below for the compound context. See Radio/Input/
    // Select wrappers for the same pass-through pattern.
    ...sparProps
  } = rest;

  // Spar owns the controlled/uncontrolled reconciliation and layers its own
  // `indeterminate` prop over `checked` / `defaultChecked` without taking
  // ownership of the value (`indeterminate` wins while set, per
  // `packages/react-spar/docs/coding-standards.md`). A user toggle out of the
  // mixed state advances Spar's internal boolean and fires `onChange(true)`,
  // so clearing `indeterminate` from `onChange` lands on the new boolean state
  // in a single interaction. The wrapper only narrows the public `checked` /
  // `defaultChecked` types to `boolean` and flattens `onChange`: Spar's
  // user-toggle path always transitions to `true | false` (it never re-emits
  // `'indeterminate'`), so the boolean callback signature is safe. A
  // render-prop `setChecked('indeterminate')` still reaches Spar unchanged and
  // is reported here as `false`.
  const handleSparChange = (next: CheckedState) => {
    onChange?.(next === true);
  };

  return (
    <SparCheckbox
      {...(sparProps as unknown as SparCheckboxProps)}
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      onChange={handleSparChange}
      ref={ref}
      {...rootAttrs}
    >
      {(state: SparCheckboxRenderProps) => (
        <CheckboxProvider
          value={{
            classNames,
            slotProps,
            // Read the *resolved* behavior state off Spar's render-prop so the
            // compound context reflects Field-inherited values, not the raw
            // props. `state.required` / `state.invalid` already fold in
            // `fieldCtx`, so `<Field disabled>` / `<Field invalid>` reach the
            // Label asterisk and slotted styling correctly.
            required: state.required,
            invalid: state.invalid,
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
