---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': patch
---

Resolve the findings from the September test-coverage pass (issues #215–#227).

Behavior fixes:

- Core: an instance prop passed as an explicit `undefined` no longer wipes a
  provider `defaultProps` value; a theme `className` and `classNames.root` now
  add up instead of one being dropped; disclosure indicators fall back to the
  default chevron for every empty node (`null`, booleans, `''`), not only
  `undefined`.
- Provider: `data-theme` / `lang` are restored correctly when sibling providers
  unmount in any order, `lang` is removed when the document had none, and only
  the outermost provider writes to `<html>` (nested providers scope context
  only).
- Accordion: `Accordion.Indicator` keeps `aria-hidden` under `slotProps.root`;
  `Accordion.Header` `level` is typed `1 | 2 | 3 | 4 | 5 | 6`; every part raises
  an `Accordion.<Part>` error outside its root.
- Popover / Tooltip: `Header` and `Description` honor the polymorphic `as`.
- Input: read-only or disabled `Input.Chips` ignores Enter/separator; an ignored
  commit (max reached, duplicate) keeps the typed text; clearing typed text with
  no tags no longer fires `onValueChange([])`; removing a tag with the keyboard
  moves focus to a neighbouring tag or the field; `Input.RevealButton` accepts a
  custom `aria-label`; a consumer `disabled` on `Increment` / `Decrement` /
  `RevealButton` is honoured.
- Chip: Enter/Space on the remove button removes the chip instead of activating
  it; a clickable + removable chip no longer nests the remove button inside a
  `role="button"` node (the action moves to the label slot, axe passes);
  `slotProps.root` `role` / `tabIndex` are honoured; a disabled chip is always
  out of the tab order; a remove click no longer bubbles into `onClick`.
- Button: a disabled or loading `<Button as="a" href>` no longer navigates;
  `data-loading` / `data-disabled` cannot be overridden through `slotProps`.
- Dropdown / Select: `contentWidth="trigger"` re-measures the trigger's border
  box when the overlay opens.
- Table: the `select` column-filter preset works inside the filter popover;
  `classNames.filterButton` / `slotProps.filterButton` reach the trigger.
- Spinner: `role={undefined}` / `aria-label={undefined}` keep the status
  defaults. Field: a boolean `children` no longer paints the description / error
  icon. Checkbox: clearing `indeterminate` from `onChange` in uncontrolled mode
  takes a single click. Drawer, Breadcrumb and Alert parts raise a descriptive
  error outside their root. `Select.Separator` renders as a presentational node
  so the documented anatomy passes axe. Card sub-parts use dotted
  `displayName`s.

Documentation and types: corrected JSDoc for Popover, Tooltip, Dropdown and
Radio callbacks whose documented `preventDefault` or handler composition Spar
does not honour; fixed the Drawer / Dialog `forceMount` default (`true`), the
Drawer `placement` default, the Toaster `children` type, the Breadcrumb.Item
data-attribute rows, and the Popover role / modal prose; the slot registry now
lists every shipped base.

Breaking type changes: `Tooltip.Content` drops the never-called
`onPointerDownOutside` / `onOpenAutoFocus` / `onCloseAutoFocus`;
`Input.Strength` drops the never-rendered `children`; the clickable + removable
`Chip` carries `role="button"` on `.tk-chip-label` rather than on the root.
