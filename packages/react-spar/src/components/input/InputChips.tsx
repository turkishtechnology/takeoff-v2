import { useCallback, useEffect, type ElementType } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { useControllableState } from '../../hooks';

import { InputChipsBase } from './base';
import { useInputOwnContext } from './context';
import { InputChip } from './InputChip';
import type { InputChipsProps } from './types';

// Mirrors InputClearButton's native value setter so committing/clearing a tag
// goes through React's input pipeline (keeps the scalar fieldValue mirror in
// sync for any sibling ClearButton/Strength).
const clearFieldValue = (field: HTMLInputElement | HTMLTextAreaElement) => {
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  valueSetter?.call(field, '');
  field.dispatchEvent(new Event('input', { bubbles: true }));
};

export const InputChips = <T extends ElementType = 'div'>(props: InputChipsProps<T>) => {
  const theme = useComponentTheme('InputChips');
  const { disabled, readOnly } = useInputContext();
  const { fieldRef } = useInputOwnContext('Input.Chips');

  const { rootAttrs, rest } = composeRootAttrs(InputChipsBase, props as InputChipsProps<'div'>, theme);

  const { as, value, defaultValue, onValueChange, separator, max, allowDuplicates = false, children, ref, ...rendered } = rest;
  const Component = (as ?? 'div') as ElementType;

  const [chips = [], setChips] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange);

  const addChip = useCallback(
    (raw: string) => {
      if (disabled || readOnly) return;
      const label = raw.trim();
      if (!label) return;
      if (max !== undefined && chips.length >= max) return;
      if (!allowDuplicates && chips.includes(label)) return;
      setChips([...chips, label]);
    },
    [chips, disabled, readOnly, max, allowDuplicates, setChips],
  );

  const removeChip = useCallback(
    (index: number) => {
      if (disabled || readOnly) return;
      setChips(chips.filter((_, i) => i !== index));
    },
    [chips, disabled, readOnly, setChips],
  );

  const removeLast = useCallback(() => {
    if (disabled || readOnly || chips.length === 0) return;
    setChips(chips.slice(0, -1));
  }, [chips, disabled, readOnly, setChips]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || (separator && event.key === separator)) {
        if (!field.value.trim()) return;
        event.preventDefault();
        addChip(field.value);
        clearFieldValue(field);
      } else if (event.key === 'Backspace' && field.value === '') {
        removeLast();
      }
    };
    field.addEventListener('keydown', handleKeyDown as EventListener);
    return () => field.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [fieldRef, addChip, removeLast, separator]);

  return (
    <Component {...rendered} ref={ref} {...rootAttrs}>
      {chips.map((chip, index) => (
        <InputChip key={`${chip}-${index}`} onRemove={() => removeChip(index)}>
          {chip}
        </InputChip>
      ))}
      {children}
    </Component>
  );
};

InputChips.displayName = 'Input.Chips';
