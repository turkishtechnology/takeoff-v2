---
'@takeoff-ui/react-spar': patch
---

`Table` utility columns and the page jump are now reachable by assistive
technology.

- The selection column in single mode and the expansion column had empty header
  cells, so every such table failed axe's empty-table-header rule. Both now
  carry a visually hidden name: "Row selection" and "Row details".
- In single selection mode the row radios had no accessible name, because the
  label sat on each one-item radio group instead of the radio. It is now on the
  radio, which also renders as a span so Spar's `<label role="radio">` no longer
  trips aria-allowed-role.
- The "Go to page" submit was an `Input.TrailingIcon`, which hides itself from
  assistive technology, so a focusable button had no accessible presence. It is
  now a text `Button` in the input's `tk-input-action` hook.
