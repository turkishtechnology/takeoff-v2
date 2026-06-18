---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Refactor Input compound anatomy and complete design-system parity.

- Removed `Input.Container`.
- Moved the bordered row onto the `Input` root.
- Added `Input.LeadingIcon` and `Input.TrailingIcon`.
- Added `Input.ClearButton`, `Input.Spinner`, and `Input.RevealButton`.
- Added `Input.Strength`, a four-segment password strength meter that grades the
  field value and renders below the bordered row.
- Added `Input.Stepper`, `Input.Decrement`, and `Input.Increment` for native
  number input stepping.
- Reshaped the placeholder eye / eye-off icons to the design system's Material
  Symbols glyphs and added a matching `lock` icon.
- `Field.Description` and `Field.ErrorMessage` now render a leading info / error
  icon, matching the design system's helper-text anatomy.
