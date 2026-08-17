---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

Move the wrapper icons onto the official Takeoff set and settle a batch of panel
/ row sizing issues that came out of it.

**Official glyphs.** `Alert.Close`, `Chip`'s remove control,
`Input.ClearButton`, `Input.Increment` / `Input.Decrement` and
`Field.ErrorMessage` now render `@takeoff-icons/react` glyphs (`close`,
`chevron-top` / `chevron-bottom`, `alert-circle`) instead of the inline
Lucide-derived placeholders, and `Checkbox.Indicator` renders the official
`check` / `remove`. The placeholder module keeps only the three glyphs the icon
set does not ship — `info` and `eye` / `eye-off` are still missing as of
`@takeoff-icons/react` 0.2.0, so `Field.Description` and `Input.RevealButton`
stay on their inline SVGs; the stroked Lucide base and every replaced glyph are
deleted.

Swapping the art changes its optical size, because the official glyphs are drawn
well inside the 24×24 grid: the check spans ~9.3 units against the
placeholder's 17. Two recipes compensate so nothing looks bigger or smaller than
before. The Checkbox icon box scales the svg per size and per state (base 22px /
14px, small 18px / 12px, with `flex: none` so the icon box cannot squash it back
down), which keeps the painted mark's width within ~0.2px of the placeholder's
at both sizes. `Field.ErrorMessage`'s icon drops to the helper-text size and
lifts 1px, since the edge-to-edge official glyph read larger and lower than the
inset placeholder the description still renders.

**Alert.** The filled surface's action colour is qualified with `.tk-button`
(`.tk-alert-action.tk-button`). The rule and the Button's own variant colour
were both `(0,4,0)`, so the winner came down to source order — and CSS minifiers
reorder equal-specificity rules, which is why a filled toast's action label
rendered light in dev and variant-coloured (dark green on green, ~1.9:1
contrast) in a production build. The gradient appearance now takes a
`$gradient-border-color` (defaulting to the variant's base colour) instead of
inheriting the sub-base border, and `Alert.Close` anchors to the top-right of
the row rather than being centred.

**Chip / Input.** `chip-size` sets `height` instead of `min-height`, so the size
token is the outer box: with the root's `box-sizing: border-box` the border and
padding resolve inside it and a chip measures exactly 20 / 24 / 28px instead of
overshooting to 22 / 26 / 34. Chips inside an Input are additionally pinned to
the field's own line box, so committing the first tag no longer pushes the
bordered row open — the row keeps its height whether it is empty or full.

**Tabs.** In the horizontal `divided` type the strip's rule moves from the
list's `border-bottom` into its padding box as a 1px background line. The list
is a scroll container, and a scroll container clips its children at the padding
box, so a trigger could never paint over a rule that lived in the border area.
Every divided tab now carries the same bottom border pulled 1px down over that
line and only its colour flips on selection, so the active tab merges into the
panel without the 1px height jump and the grey `currentColor` flash the previous
version animated through.

**Select / Dropdown group headings.** Both panels' group headings now carry
their own divider: `Select.Label` and `Dropdown.Label` are flex rows whose
`::after` rule runs out to the panel edge, so consecutive groups read as banded
sections and neither panel needs a `Select.Separator` / `Dropdown.Separator`
between them (the parts stay, for separating plain items). The headings also
drop the uppercase / letter-spacing treatment and move to `--text-dark` at 400
weight, with an 8px inline inset — the same one the items use, so the rule stays
flush at every size — 10px between text and rule, and a type step per size: 11px
in `small`, `--desktop-body-xs-size` in `base`, `--desktop-body-s-size` in
`large`.
