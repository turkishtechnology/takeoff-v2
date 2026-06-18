---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Complete Input parity with takeoff-ui: chips, counter, and styling fixes.

- Added `Input.Chips` and `Input.Chip` for chips/tags inputs. `Input.Chips` owns
  a `string[]` value (controlled `value` / `onValueChange` or uncontrolled
  `defaultValue`), commits the trimmed field text on Enter or an optional
  `separator`, removes the last tag on Backspace, and supports `max` /
  `allowDuplicates`. `Input.Chip` is a removable token with a focusable,
  labelled remove button. v1 is `string[]`-only (no object values /
  `chipLabelKey` / `chipOptions` / `chipDisabled`).
- Added the **counter** treatment: placing `Input.Decrement` / `Input.Increment`
  as direct children flanking `Input.Field` (outside `Input.Stepper`) now
  centers the value and paints the step buttons in the brand colour, matching
  takeoff-ui. No `mode` prop is introduced.
- Added `useControllableState` and a `PlaceholderAdd` glyph.
- Parity fixes: read-only field text is no longer dimmed (matches takeoff-ui),
  and the strength-meter gap and prefix/suffix dividers now use design tokens
  (`--spacing-xs` / `--spacing-px`).
- Documented that masking/formatting is consumer-owned (via `Input.Field`
  `onChange`), the password reveal is a keyboard-accessible toggle, and number
  stepping is native-only.
