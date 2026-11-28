import React, { useCallback, useMemo, useState, type ElementType } from 'react';
import { useControlledState, useItemRegistry } from '@/hooks';
import { ToggleGroupContext } from './hooks';
import type { ToggleGroupContextValue, ToggleGroupProps, ToggleGroupValue } from './types';

const normalizeValue = (input: ToggleGroupValue | undefined, multiple: boolean): ToggleGroupValue => {
  if (multiple) {
    if (input === undefined || input === '') return [];
    return Array.isArray(input) ? input : [input];
  }
  if (input === undefined) return '';
  if (Array.isArray(input)) return input.length === 0 ? '' : input[input.length - 1]!;
  return input;
};

const toArray = (value: ToggleGroupValue | undefined): string[] => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const PREVIOUS_KEY = { horizontal: 'ArrowLeft', vertical: 'ArrowUp' } as const;
const NEXT_KEY = { horizontal: 'ArrowRight', vertical: 'ArrowDown' } as const;

/**
 * A group of toggle buttons with single or multiple selection (renders
 * `role="group"`; items are `aria-pressed` buttons).
 *
 * The group is one tab stop (roving tabindex): the focused item, else the
 * first pressed enabled item, else the first enabled item. Arrow keys along
 * `orientation` move focus and wrap; Home / End jump to the ends; disabled
 * items are skipped. Moving focus never changes the value — Space / Enter (the
 * Button's own activation) press the focused item.
 *
 * Consumer `onKeyDown` / `onBlur` handlers are composed with the internal ones:
 * the consumer handler runs first, and calling `event.preventDefault()` inside
 * `onKeyDown` vetoes the built-in navigation for that key press.
 */
export const ToggleGroup = <T extends ElementType = 'div'>({
  ref,
  as,
  multiple = false,
  value: controlledValue,
  defaultValue,
  onValueChange,
  deselectable = true,
  disabled = false,
  orientation = 'horizontal',
  onKeyDown,
  onBlur,
  children,
  ...rest
}: ToggleGroupProps<T>) => {
  const Component = as || 'div';

  const [value, setValue] = useControlledState<ToggleGroupValue>(
    controlledValue !== undefined ? normalizeValue(controlledValue, multiple) : undefined,
    normalizeValue(defaultValue, multiple),
    onValueChange,
  );
  const pressedValues = useMemo(() => toArray(value), [value]);

  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const { items, registerItem: registerEnabledItem, unregisterItem, getItemIndex, getItemAtIndex, count } = useItemRegistry<HTMLElement>();

  // Only enabled items take part in keyboard navigation and the tab stop. The
  // registry orders lookups by DOM position, so an item that toggles
  // `disabled` and re-registers keeps its place.
  const registerItem = useCallback(
    (itemValue: string, element: HTMLElement, itemDisabled: boolean) => {
      if (itemDisabled) {
        unregisterItem(itemValue);
        return;
      }
      registerEnabledItem(itemValue, element);
    },
    [registerEnabledItem, unregisterItem],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      const isPressed = pressedValues.includes(itemValue);
      if (multiple) {
        setValue(isPressed ? pressedValues.filter(v => v !== itemValue) : [...pressedValues, itemValue]);
        return;
      }
      if (!isPressed) {
        setValue(itemValue);
      } else if (deselectable) {
        setValue('');
      }
    },
    [pressedValues, multiple, deselectable, setValue],
  );

  // Before any item has registered (`count === 0`, e.g. the SSR pass) the
  // pressed value is trusted so the markup still carries a tab stop.
  const tabStopValue = useMemo<string | null>(() => {
    if (focusedValue !== null && items.has(focusedValue)) return focusedValue;
    const firstPressed = pressedValues.find(v => count === 0 || items.has(v));
    if (firstPressed !== undefined) {
      if (count === 0) return firstPressed;
      // The first pressed item in DOM order, not in value order.
      const ordered = pressedValues.filter(v => items.has(v)).sort((a, b) => getItemIndex(a) - getItemIndex(b));
      return ordered[0]!;
    }
    return getItemAtIndex(0) ?? null;
  }, [focusedValue, items, pressedValues, count, getItemIndex, getItemAtIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || count === 0 || disabled) return;

      const currentIndex = focusedValue !== null ? getItemIndex(focusedValue) : -1;
      let nextIndex: number;
      switch (event.key) {
        case PREVIOUS_KEY[orientation]:
          nextIndex = currentIndex <= 0 ? count - 1 : currentIndex - 1;
          break;
        case NEXT_KEY[orientation]:
          nextIndex = currentIndex === -1 || currentIndex >= count - 1 ? 0 : currentIndex + 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = count - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextValue = getItemAtIndex(nextIndex);
      if (nextValue !== undefined) {
        // The item's onFocus records the focused value.
        items.get(nextValue)?.focus();
      }
    },
    [onKeyDown, count, disabled, focusedValue, getItemIndex, orientation, getItemAtIndex, items],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      const next = event.relatedTarget as Node | null;
      if (!next || !event.currentTarget.contains(next)) {
        setFocusedValue(null);
      }
    },
    [onBlur],
  );

  const contextValue = useMemo<ToggleGroupContextValue>(
    () => ({
      pressedValues,
      toggle,
      disabled,
      orientation,
      tabStopValue,
      setFocusedValue,
      registerItem,
      unregisterItem,
    }),
    [pressedValues, toggle, disabled, orientation, tabStopValue, registerItem, unregisterItem],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <Component
        ref={ref}
        role="group"
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        data-multiple={multiple ? '' : undefined}
        {...rest}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        {children}
      </Component>
    </ToggleGroupContext.Provider>
  );
};

ToggleGroup.displayName = 'ToggleGroup';
