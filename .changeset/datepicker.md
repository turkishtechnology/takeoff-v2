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
- `tk-input-action` on `Popover.Trigger` matches the in-field action buttons
  when the trigger sits inside an `Input`. It belongs to `Input` rather than to
  this pattern — it is the opt-in hook for any control a consumer places in a
  field, and carries no rules of its own: it joins the lists the Input recipe
  already uses, so an in-field trigger is `Input.ClearButton`'s twin at every
  size.

Neither is emitted automatically; apply them through `classNames`.
