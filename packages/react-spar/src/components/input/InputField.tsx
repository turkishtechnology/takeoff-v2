import { useCallback, useEffect, type ChangeEvent, type ElementType, type FormEvent, type Ref, type RefObject } from 'react';
import { InputField as SparInputField, type InputFieldProps as SparInputFieldProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputFieldBase } from './base';
import { useInputOwnContext } from './context';
import type { InputFieldProps } from './types';

type RenderedInputFieldProps = {
  as?: ElementType;
  type?: string;
  onInput?: (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
} & Record<string, unknown>;

export const InputField = <T extends ElementType = 'input'>(props: InputFieldProps<T>) => {
  const theme = useComponentTheme('InputField');
  const { fieldRef, setFieldNode, setFieldValue, revealed, setRevealed } = useInputOwnContext('Input.Field');

  const { rootAttrs, rest } = composeRootAttrs(InputFieldBase, props as InputFieldProps<'input'>, theme);

  const { as, ref, type, onInput, onChange, ...spar } = rest as RenderedInputFieldProps;
  const effectiveType = type === 'password' && revealed ? 'text' : type;
  const renderedType = as === 'textarea' ? undefined : effectiveType;
  const setFieldRef = useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node;
      // Also publish the node as reactive state so parts that subscribe to it
      // (Input.Chips's keydown listener) re-bind when the field is replaced.
      setFieldNode(node);
      if (node) setFieldValue(node.value);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node;
      }
    },
    [fieldRef, ref, setFieldNode, setFieldValue],
  );

  // Mirror the live DOM value into context when a controlled `value` (or
  // `defaultValue`) changes from the outside — typing is already mirrored by
  // handleInput/handleChange, and the mount sync runs in setFieldRef, so this
  // only needs to re-run when the externally-supplied value changes (not on
  // every render).
  useEffect(() => {
    const node = fieldRef.current;
    if (node) setFieldValue(node.value);
  }, [fieldRef, setFieldValue, spar.value, spar.defaultValue]);

  // `revealed` lives on the shared Input context, so reset it when this field
  // unmounts — otherwise a later password field would mount already revealed
  // and leak its value as plain text.
  useEffect(() => () => setRevealed(false), [setRevealed]);

  const handleInput = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInput?.(event);
    setFieldValue(event.currentTarget.value);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(event);
    setFieldValue(event.currentTarget.value);
  };

  return (
    <SparInputField
      {...(spar as unknown as SparInputFieldProps)}
      as={as}
      type={renderedType}
      onInput={handleInput}
      onChange={handleChange}
      ref={setFieldRef as Ref<HTMLInputElement>}
      {...rootAttrs}
    />
  );
};

InputField.displayName = 'Input.Field';
