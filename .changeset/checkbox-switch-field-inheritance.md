---
'@takeoff-ui/react-spar': patch
---

Fix `Checkbox` and `Switch` ignoring `disabled` / `readOnly` / `required` /
`invalid` inherited from a wrapping `<Field>`.

Both wrappers applied an eager `= false` default to these behavior props and
forwarded them to Spar unconditionally. That turned an omitted prop into an
explicit `false`, defeating Spar's `prop ?? fieldCtx?.value` inheritance chain —
so a `<Field disabled>` checkbox stayed clickable and a `<Field invalid>` switch
never showed the invalid state.

The props are now passed through untouched (matching the `Radio` / `Input` /
`Select` wrappers), so an omitted prop stays `undefined` and Spar reads the
Field value. Passing the prop explicitly on the control still overrides the
Field, as before.
