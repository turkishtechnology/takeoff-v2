---
'@takeoff-design/tokens': minor
---

Two opt-in classes for composing a date picker out of `Popover` and `Calendar`.

There is no DatePicker component — the pattern is documented instead. What the
design system supplies is the pair of corrections the composition needs, so
every picker looks the same without each app writing its own:

- `tk-datepicker-panel` on `Popover.Content` lifts the bubble's 296px width cap
  and its padding, so a calendar fits instead of being clipped, and drops the
  grid's standalone border once it is floating.
- `tk-datepicker-trigger` on `Popover.Trigger` matches the in-field action
  buttons when the trigger sits inside an `Input`.

Neither is emitted automatically; apply them through `classNames`.
