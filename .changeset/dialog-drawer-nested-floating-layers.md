---
'@takeoff-ui/react-spar': patch
---

`Dialog` and `Drawer` no longer close when you pick an option in a `Select`, or
press inside a `Popover`, `Dropdown` or date-picker popover, that is rendered
inside the panel.

Those floating layers are portaled to `document.body`, and Spar's outside-press
check (a DOM `contains` test on the panel) treated every press inside them as a
press outside the dialog and closed it, losing the form state. The fix lives in
`@turkish-technology/spar` 0.3.1, which now counts presses that start anywhere
in the panel's React subtree, portaled descendants included, as inside; this
package now depends on that release. Such presses are no longer reported to
`onPointerDownOutside` / `onInteractOutside`. Genuine outside presses still
close the panel, and `dismissible={false}` behaves as before.
