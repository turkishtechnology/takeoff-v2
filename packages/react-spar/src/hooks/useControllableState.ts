import { useCallback, useRef, useState } from 'react';

/**
 * Manages the controlled/uncontrolled value pattern. Mirrors Spar's
 * `useControlledState` (which Spar does not re-export from its package root) so
 * react-enhancement parts that own state — e.g. `Input.Chips` — share the exact
 * same semantics. Pass `controlledValue` for controlled mode, `defaultValue` for
 * uncontrolled mode; `onChange` fires on every committed change.
 *
 * Mode is latched on the first render (like React's native inputs): a component
 * that mounts controlled stays controlled for its lifetime, and one that mounts
 * uncontrolled stays uncontrolled, so a `controlledValue` that later flips
 * between `undefined` and a real value never silently drops the internal state.
 *
 * Returns `[value, setValue, isControlled]`. The third element is the latched
 * mode, for the callers whose behavior depends on whether a commit is
 * guaranteed to come back as the next render's value (it is only in
 * uncontrolled mode — a controlled parent may decline the change).
 */
export function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T | undefined,
  onChange: ((value: T) => void) | undefined,
): [T | undefined, (value: T) => void, boolean] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const { current: isControlled } = useRef(controlledValue !== undefined);
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

  return [value, setValue, isControlled];
}
