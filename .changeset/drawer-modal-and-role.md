---
'@takeoff-ui/react-spar': minor
---

`Drawer` accepts `modal`, and `Drawer.Panel` accepts `role`.

A modal drawer takes the page over: it traps focus, locks body scroll, and puts
a pointer-swallowing overlay between the reader and everything behind the panel.
That is right for a drawer that interrupts — a form, a confirmation — and wrong
for one that inspects something still on screen. Until now modality was fixed,
so the second kind had no way to exist.

`modal={false}` leaves the page live behind the panel: the reader keeps
scrolling, and a click on the content behind reaches it. Escape and
`Drawer.Close` still dismiss, and `dismissible` still governs click-away. Pair
it with omitting `Drawer.Overlay` — the overlay is what swallows pointer events,
and the scroll lock comes from the root, so both have to go for the page to stay
interactive.

`role` defaults to `'dialog'` and was already exposed by `Dialog.Panel`; the
drawer's omission was an oversight rather than a decision, so the two panels now
offer the same surface. Pass `role="alertdialog"` for a drawer that interrupts
and must be acknowledged.

Both are picked from Spar's dialog types alongside the rest of the root's state.
Only `forceMount` stays unexposed, because the panel has to outlive the open ->
closed boundary for the slide-out animation to run.

Existing drawers are untouched: the defaults are the behaviour they already had.
