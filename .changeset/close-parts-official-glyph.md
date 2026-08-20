---
'@takeoff-ui/react-spar': patch
---

`Dialog.Close`, `Drawer.Close` and `Popover.Close` now render the official
`close` glyph when given no children, matching what `Alert.Close` already did,
and fall back to a `Close` accessible name the same way. Docs and skill examples
previously reached for a literal `✕` (or a lowercase `x`) text character, which
neither matched the icon set nor took its sizing; those examples are now just
`<Dialog.Close />`. Passing children — including Spar's render-prop form — still
overrides the default.
