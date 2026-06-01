import { useCallback, useState } from 'react';

/**
 * Manages the controlled/uncontrolled value pattern. Mirrors Spar's
 * `useControlledState` (which Spar does not re-export from its package root) so
 * react-enhancement parts that own state — e.g. `Input.Chips` — share the exact
 * same semantics. Pass `controlledValue` for controlled mode, `defaultValue` for
 * uncontrolled mode; `onChange` fires on every committed change.
 */
export function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T | undefined,
  onChange: ((value: T) => void) | undefined,
): [T | undefined, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
