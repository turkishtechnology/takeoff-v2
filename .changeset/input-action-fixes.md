---
'@takeoff-ui/react-spar': patch
---

Fix Input action and field correctness bugs:

- `Input.Increment` / `Input.Decrement` no longer throw when composed with a
  non-number field — `stepUp()` / `stepDown()` are now guarded so a text input
  is a safe no-op instead of an uncaught `InvalidStateError`.
- `Field.Description` and `Field.ErrorMessage` no longer render a stray leading
  icon when they have no (or empty) content.
- The password reveal state is reset when the field unmounts, so a later
  password field can't mount already revealed and leak its value as plain text.
- `Input.RevealButton` re-hides the password on form submit even when the form
  or field mounts after the button.
- `useControllableState` latches controlled vs. uncontrolled mode on the first
  render (matching React's native inputs), so a `value` that flips between
  `undefined` and a real value no longer silently drops internal state.
- `Input.Strength` is hoisted below the bordered row by component reference
  instead of a `displayName` string, so it still works in minified builds.
- Perf: the Input context value is memoized (consumers no longer re-render on
  every keystroke) and `Input.Field`'s value-mirror effect only runs when the
  controlled value changes rather than on every render.
- Internal: centralize the native-value-setter and number-stepping DOM helpers
  shared by the action parts.
