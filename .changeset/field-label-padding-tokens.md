---
'@takeoff-design/tokens': patch
---

Give `Field`'s label and the standalone `Label` the inset their design tokens
have always defined for them.

`.tk-field-label` and `.tk-label` carried no padding at all, so a label sat
flush against the edge of its wrapper while the `input-external-label-*` family
— the same family `Input` and `Select` already read their padding, gap, and
radius from — shipped `label-h-padding` / `label-v-padding` entries that no
recipe consumed. Both recipes now apply them: `8px` horizontal, `0` vertical.
`Field` steps down to the small variant (`6px`) when the control it wraps
reports `data-size="small"`, matching how `Input` and `Select` scale; the
standalone `Label` has no size context to read, so it stays on the large inset.

Two hand-written offsets go away in the same pass. The required asterisk's
`margin-inline-start: 0.125rem` is dropped so `*` sits tight against the label
text as the design shows it — on `Field`'s `.tk-field-asterisk` span and on
`Label`'s `[data-required]::after` alike. The helper text's
`margin-block-start: var(--spacing-xxs)` is dropped too, because `Field`'s root
already spaces its rows with `--input-external-label-base-div-gap`; the extra
`2px` stacked on top of that gap and pushed description and error messages `6px`
below the control instead of the intended `4px`.

Styling only — no markup, class name, token value, or API changes.
