import { Children, isValidElement, useCallback, useRef, useState, type ElementType, type ReactNode } from 'react';
import { Input as SparInput, type InputProps as SparInputProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputBase } from './base';
import { InputProvider } from './context';
import { DEFAULT_SIZE } from './defaults';
import type { InputProps } from './types';

export const Input = <T extends ElementType = 'div'>(props: InputProps<T>) => {
  const theme = useComponentTheme('Input');
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const toggleReveal = useCallback(() => setRevealed(value => !value), []);

  // `data-invalid`, `data-disabled`, `data-required`, `data-readonly` are NOT
  // emitted here — Spar's Input root already sets them. `data-size` is
  // takeoff-v2's own visual vocabulary, so it lives here.
  const { rootAttrs, rest } = composeRootAttrs(InputBase, props as InputProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE }) => ({
      'data-size': size,
    }),
  });

  const { size = DEFAULT_SIZE, children, ref, ...sparProps } = rest;

  // Input.Strength is a sibling *below* the bordered row in the design, but it
  // reads the field value from the Input context. Hoist it out of SparInput so
  // it renders after the row while staying inside the provider.
  const rowChildren: ReactNode[] = [];
  const belowChildren: ReactNode[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child) && (child.type as { displayName?: string })?.displayName === 'Input.Strength') {
      belowChildren.push(child);
    } else {
      rowChildren.push(child);
    }
  });

  return (
    <InputProvider value={{ size, fieldRef, fieldValue, setFieldValue, revealed, setRevealed, toggleReveal }}>
      <SparInput {...(sparProps as unknown as SparInputProps)} ref={ref} {...rootAttrs}>
        {rowChildren}
      </SparInput>
      {belowChildren}
    </InputProvider>
  );
};

Input.displayName = 'Input';
