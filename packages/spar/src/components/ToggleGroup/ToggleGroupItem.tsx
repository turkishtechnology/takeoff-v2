import React, { useCallback, useEffect, useRef, type ElementType } from 'react';
import { useMergedRef } from '@/hooks';
import { Button } from '../Button';
import type { ButtonProps } from '../Button/types';
import { useToggleGroupContext } from './hooks';
import type { ToggleGroupItemProps } from './types';

/**
 * One toggle in a ToggleGroup. Renders a Spar `Button` whose pressed state is
 * owned by the group, so `aria-pressed`, `data-pressed`, Space / Enter
 * activation and disabled handling stay the Button's. Only the group's tab
 * stop carries `tabIndex={0}`; the others are `-1`.
 *
 * A consumer `onFocus` handler runs before the internal one.
 */
export const ToggleGroupItem = <T extends ElementType = 'button'>({ ref, value, disabled: itemDisabled = false, onFocus, children, ...rest }: ToggleGroupItemProps<T>) => {
  const { pressedValues, toggle, disabled: groupDisabled, tabStopValue, setFocusedValue, registerItem, unregisterItem } = useToggleGroupContext();

  const itemRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRef(itemRef, ref);
  const isDisabled = groupDisabled || itemDisabled;
  const isPressed = pressedValues.includes(value);

  useEffect(() => {
    if (itemRef.current) {
      registerItem(value, itemRef.current, isDisabled);
    }
    return () => unregisterItem(value);
  }, [value, isDisabled, registerItem, unregisterItem]);

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
      if (!isDisabled) setFocusedValue(value);
    },
    [onFocus, isDisabled, setFocusedValue, value],
  );

  const handlePressedChange = useCallback(() => toggle(value), [toggle, value]);

  return (
    <Button
      {...(rest as ButtonProps<ElementType>)}
      ref={mergedRef}
      data-value={value}
      disabled={isDisabled}
      isPressed={isPressed}
      onPressedChange={handlePressedChange}
      tabIndex={!isDisabled && tabStopValue === value ? 0 : -1}
      onFocus={handleFocus}
    >
      {children}
    </Button>
  );
};

ToggleGroupItem.displayName = 'ToggleGroupItem';
