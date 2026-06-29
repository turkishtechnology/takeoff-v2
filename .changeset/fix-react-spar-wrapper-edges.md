---
'@takeoff-ui/react-spar': patch
---

Fix React SPAR documentation and wrapper edge cases:

- Update the README to match the current exported component surface and provider
  behavior.
- Compose `slotProps` event handlers for `Alert.Close` and `Chip` instead of
  letting them replace internal behavior.
- Preserve custom non-dismissible dismiss handlers in `Drawer.Panel`, matching
  `Dialog.Panel`.
- Preserve renderable falsy content such as `0` in `Button` and `Badge` slots.
