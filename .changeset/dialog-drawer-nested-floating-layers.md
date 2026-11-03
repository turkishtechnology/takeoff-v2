---
'@takeoff-ui/react-spar': patch
---

`Dialog` and `Drawer` no longer close when you pick an option in a `Select`, or
press inside a `Popover`, `Dropdown` or date-picker popover, that is rendered
inside the panel.

Those floating layers are portaled to `document.body`, so Spar's outside-press
check (a DOM `contains` test on the panel) treated every press inside them as a
press outside the dialog and closed it, losing the form state. `Dialog.Panel`
and `Drawer.Panel` now recognise presses that start in their own React subtree,
including portaled descendants, and do not report them to `onPointerDownOutside`
/ `onInteractOutside`. Genuine outside presses still close the panel, and
`dismissible={false}` behaves as before.
