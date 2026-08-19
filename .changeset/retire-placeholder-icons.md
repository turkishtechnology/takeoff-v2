---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

Retire the last inlined glyphs now that `@takeoff-icons` 0.3.0 ships them:
`Field.Description` uses `info` and `Input.RevealButton` uses `eye-open` /
`eye-closed`, so the `placeholderIcons` module is gone and every glyph
react-spar renders comes from the official icon set.

With both helper-text glyphs now drawn edge to edge on the official 24x24 grid,
the field recipe's size-and-lift correction folds back from an error-only
override into the shared description/error icon rule, so the two line up
identically.

Also drops `renderIconSymbol`, dead since the compound API landed: nothing
called it, it was never exported from the package root, and no component emits
the `data-icon-kind` attribute it documented.
