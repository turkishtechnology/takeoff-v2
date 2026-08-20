---
'@takeoff-ui/react-spar': patch
---

Bump `@takeoff-icons/react` to `^0.4.0`, which brings 9 new icons (1128 total)
into the icon set available through react-spar.

The release also redraws `alert-circle`, `chevron-bottom` and `info`, all three
of which react-spar renders itself — in `Field.ErrorMessage`, `Input.Increment`
/ `Input.Decrement` and `Field.Description` respectively. They were snapped to
the 1px grid in Figma, so their inner shapes shift by a few tenths of a unit;
`info` is the most visible, with its stem and dot each shrinking from 2.56 to
2.0 units.
