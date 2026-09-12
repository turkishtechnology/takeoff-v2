---
'@takeoff-ui/react-spar': patch
---

`Select` now marks itself invalid, and `Select.Indicator` follows the open
state.

`<Select invalid>` set `data-invalid` on the trigger and nowhere else. The prop
never reached Spar, whose root writes `data-invalid` after the props it spreads,
so the root lost the attribute and the trigger never got `aria-invalid`. It is
now passed through as given, so an unset `invalid` still falls back to a
wrapping `Field`.

The standalone `Select.Indicator` read the open state under a name Spar's
context does not use. Its default chevron never flipped, and render-function
children always received `{ isOpen: undefined }`. Both now track the list.
