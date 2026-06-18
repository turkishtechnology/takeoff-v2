import { Children, isValidElement, useCallback, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { Input as SparInput, type InputProps as SparInputProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { InputBase } from './base';
import { InputProvider } from './context';
import { DEFAULT_SIZE } from './defaults';
import { InputStrength } from './InputStrength';
import type { InputProps } from './types';

export const Input = <T extends ElementType = 'div'>(props: InputProps<T>) => {
  const theme = useComponentTheme('Input');
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [fieldNode, setFieldNode] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const toggleReveal = useCallback(() => setRevealed(value => !value), []);

  // Registry of content-owning parts (e.g. Input.Chips) so Input.ClearButton can
  // show when any of them has content and clear all of them in one click.
  const clearablesRef = useRef(new Map<symbol, { hasContent: boolean; clear: () => void }>());
  const [hasAuxContent, setHasAuxContent] = useState(false);
  const setClearable = useCallback((id: symbol, entry: { hasContent: boolean; clear: () => void } | null) => {
    if (entry) {
      clearablesRef.current.set(id, entry);
    } else {
      clearablesRef.current.delete(id);
    }
    let any = false;
    for (const value of clearablesRef.current.values()) {
      if (value.hasContent) {
        any = true;
        break;
      }
    }
    setHasAuxContent(any);
  }, []);
  const clearAux = useCallback(() => {
    for (const value of clearablesRef.current.values()) value.clear();
  }, []);

  // `data-invalid`, `data-disabled`, `data-required`, `data-readonly` are NOT
  // emitted here — Spar's Input root already sets them. `data-size` is
  // takeoff-v2's own visual vocabulary, so it lives here.
  const { rootAttrs, rest } = composeRootAttrs(InputBase, props as InputProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE }) => ({
      'data-size': size,
    }),
  });

  const { size = DEFAULT_SIZE, children, ref, ...sparProps } = rest;

  // Memoize the context value so consumers that only read it as a mount guard
  // (Prefix/Suffix/icons/etc.) don't re-render on every keystroke. fieldRef and
  // the setters are stable; only size/fieldValue/revealed drive a new identity.
  const contextValue = useMemo(
    () => ({
      size,
      fieldRef,
      fieldNode,
      setFieldNode,
      fieldValue,
      setFieldValue,
      revealed,
      setRevealed,
      toggleReveal,
      setClearable,
      hasAuxContent,
      clearAux,
    }),
    [size, fieldNode, fieldValue, revealed, setFieldValue, setRevealed, toggleReveal, setClearable, hasAuxContent, clearAux],
  );

  // Input.Strength is a sibling *below* the bordered row in the design, but it
  // reads the field value from the Input context. Hoist it out of SparInput so
  // it renders after the row while staying inside the provider. Match by
  // component reference (not displayName) so a minified/renamed build still
  // detects it — mirrors AccordionTrigger's child partitioning.
  const rowChildren: ReactNode[] = [];
  const belowChildren: ReactNode[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === InputStrength) {
      belowChildren.push(child);
    } else {
      rowChildren.push(child);
    }
  });

  return (
    <InputProvider value={contextValue}>
      <SparInput {...(sparProps as unknown as SparInputProps)} ref={ref} {...rootAttrs}>
        {rowChildren}
      </SparInput>
      {belowChildren}
    </InputProvider>
  );
};

Input.displayName = 'Input';
