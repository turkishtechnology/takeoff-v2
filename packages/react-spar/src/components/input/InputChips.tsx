import { useCallback, useEffect, useRef, type ElementType, type RefObject } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { useControllableState } from '../../hooks';
import { Chip } from '../chip';

import { InputChipsBase } from './base';
import { useInputOwnContext } from './context';
import { setNativeValue } from './dom';
import type { InputChipsProps } from './types';

export const InputChips = <T extends ElementType = 'div'>(props: InputChipsProps<T>) => {
  const theme = useComponentTheme('InputChips');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef, fieldNode, setClearable } = useInputOwnContext('Input.Chips');

  const { rootAttrs, rest } = composeRootAttrs(InputChipsBase, props as InputChipsProps<'div'>, theme);

  const { as, value, defaultValue, onValueChange, separator, max, allowDuplicates = false, children, ref, ...rendered } = rest;
  const Component = (as ?? 'div') as ElementType;

  const [chips = [], setChips] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange);
  const hasChips = chips.length > 0;

  // Returns whether the text was committed, so the caller only empties the
  // field for a real commit — an ignored one (read-only, max reached, duplicate)
  // must leave the user's typed text in place.
  const addChip = useCallback(
    (raw: string): boolean => {
      if (disabled || readOnly) return false;
      const label = raw.trim();
      if (!label) return false;
      if (max !== undefined && chips.length >= max) return false;
      if (!allowDuplicates && chips.includes(label)) return false;
      setChips([...chips, label]);
      return true;
    },
    [chips, disabled, readOnly, max, allowDuplicates, setChips],
  );

  // Removing a tag through its remove button unmounts the focused button, so
  // focus would fall to <body> and keyboard users lose their place. Hand focus
  // to a surviving neighbour first — the previous tag's remove button, else the
  // next one, else the text field. Wrapper-owned chrome: Spar has no chips
  // model, and this is not a re-implementation of any Spar focus behavior.
  const rootRef = useRef<HTMLElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  const removeChip = useCallback(
    (index: number) => {
      if (disabled || readOnly) return;
      const removeButtons = rootRef.current?.querySelectorAll<HTMLElement>(':scope > .tk-chip > .tk-chip-remove');
      // Only when the button about to unmount holds focus; a pointer removal
      // that left focus elsewhere (e.g. in the field) keeps it there.
      if (removeButtons && removeButtons[index] === document.activeElement) {
        (removeButtons[index - 1] ?? removeButtons[index + 1] ?? fieldRef.current)?.focus();
      }
      setChips(chips.filter((_, i) => i !== index));
    },
    [chips, disabled, readOnly, fieldRef, setChips],
  );

  const removeLast = useCallback(() => {
    if (disabled || readOnly || !hasChips) return;
    setChips(chips.slice(0, -1));
  }, [chips, hasChips, disabled, readOnly, setChips]);

  // Register with the Input so a sibling Input.ClearButton stays visible while
  // there are chips and clears them (along with the typed text) in one click.
  const clearId = useRef(Symbol('input-chips')).current;
  const clearAll = useCallback(() => {
    // Nothing to clear means no state change, so no onValueChange either.
    if (disabled || readOnly || !hasChips) return;
    setChips([]);
  }, [disabled, readOnly, hasChips, setChips]);
  useEffect(() => {
    setClearable(clearId, { hasContent: hasChips, clear: clearAll });
    return () => setClearable(clearId, null);
  }, [clearId, hasChips, clearAll, setClearable]);

  useEffect(() => {
    const field = fieldNode;
    if (!field) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keystrokes while an IME composition is active — e.g. pressing
      // Enter to confirm a CJK candidate must not commit a half-composed chip.
      if (event.isComposing) return;
      // Spar owns disabled/readOnly: a field in either state neither commits
      // nor removes, and its typed text and native key behavior are left alone.
      if (disabled || readOnly) return;
      if (event.key === 'Enter' || (separator && event.key === separator)) {
        if (!field.value.trim()) return;
        // Text in the field makes Enter/the separator a commit attempt, never a
        // form submit or a typed character — even when the commit is ignored.
        event.preventDefault();
        if (addChip(field.value)) setNativeValue(field, '');
      } else if (event.key === 'Backspace' && field.value === '') {
        removeLast();
      }
    };
    field.addEventListener('keydown', handleKeyDown as EventListener);
    return () => field.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [fieldNode, addChip, removeLast, separator, disabled, readOnly]);

  // Key each tag by its label plus how many identical labels precede it, not
  // by index: an index key re-keys (remounts) every tag after a removal, which
  // would drop the focus handed to the next tag's remove button above.
  const seen = new Map<string, number>();
  const chipKeys = chips.map(chip => {
    const occurrence = seen.get(chip) ?? 0;
    seen.set(chip, occurrence + 1);
    return `${chip}#${occurrence}`;
  });

  return (
    <Component {...rendered} ref={setRootRef} {...rootAttrs}>
      {chips.map((chip, index) => (
        // Render the shared Chip token in the input's neutral/outlined parity
        // look. `autoDismiss={false}` because Input.Chips owns the tag array —
        // removal must flow through onRemove into our state, not the chip's own.
        <Chip
          key={chipKeys[index]}
          appearance="outlined"
          variant="neutral"
          size={size}
          removable={!disabled && !readOnly}
          disabled={disabled || readOnly}
          autoDismiss={false}
          // Give each remove button a tag-specific accessible name (e.g.
          // "Remove apple"). Chip exposes no `removeLabel` prop; its remove
          // <button> reads `aria-label` from `slotProps.remove`, which is
          // spread after the default so it overrides it.
          slotProps={{ remove: { 'aria-label': `Remove ${chip}` } }}
          onRemove={() => removeChip(index)}
        >
          {chip}
        </Chip>
      ))}
      {children}
    </Component>
  );
};

InputChips.displayName = 'Input.Chips';
