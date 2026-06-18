---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

More Input fixes from the review:

- `Input.Chips` ignores keystrokes during IME composition, so pressing Enter to
  confirm a CJK candidate no longer commits a half-composed chip.
- `Input.Chips`'s key handling now re-binds when the field element is replaced
  (e.g. a re-keyed/remounted `Input.Field`), so Enter/Backspace keep working.
- `Input.ClearButton` now clears chips too: it stays visible while there are
  committed tags (not only typed text) and one click wipes the typed text and
  every tag. Content-owning parts register a reset with the Input so a single
  clear empties the whole field.
- Drop 5 dead positional parameters from the `input-size` SCSS mixin (their
  bodies were removed in the anatomy refactor); compiled CSS is unchanged.
