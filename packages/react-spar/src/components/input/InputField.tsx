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
  const { fieldRef, setFieldValue, revealed } = useInputOwnContext('Input.Field');

  const { rootAttrs, rest } = composeRootAttrs(InputFieldBase, props as InputFieldProps<'input'>, theme);

  const { as, ref, type, onInput, onChange, ...spar } = rest as RenderedInputFieldProps;
  const effectiveType = type === 'password' && revealed ? 'text' : type;
  const renderedType = as === 'textarea' ? undefined : effectiveType;
  const setFieldRef = useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node;
      if (node) setFieldValue(node.value);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node;
      }
    },
    [fieldRef, ref, setFieldValue],
  );

  useEffect(() => {
    const node = fieldRef.current;
    if (node) setFieldValue(node.value);
  });

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
