---
'@takeoff-ui/react-spar': patch
---

Fix React SPAR documentation and wrapper edge cases:

- Update the README to match the current exported component surface (including
  `Table` and `Toast`) and provider behavior.
- Compose `slotProps` event handlers for `Alert.Close`, `Chip`, and the
  `Input.Increment` / `Input.Decrement` / `Input.ClearButton` /
  `Input.RevealButton` controls instead of letting them replace internal
  behavior.
- Keep `Alert.Close`'s `onClose` unconditional: a decorative `onClick` that
  calls `preventDefault` no longer suppresses the alert's dismissal.
- Stop a non-disabled `Chip` keydown handler and a removable-only `Chip`'s
  remove click from leaking past the `disabled` guard / from blocking event
  bubbling.
- Preserve custom non-dismissible dismiss handlers in `Drawer.Panel`, matching
  `Dialog.Panel`.
- Preserve renderable falsy content such as `0` in `Button` and `Badge` slots
  while keeping empty-string content from rendering an empty wrapper, via a
  shared `isRenderableNode` helper used consistently across `Button`, `Badge`,
  `Chip`, and `Alert.Close`.
