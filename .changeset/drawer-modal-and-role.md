---
'@takeoff-ui/react-spar': minor
---

`Drawer` accepts `modal` and `forceMount`, and `Drawer.Panel` accepts `role`.

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

`forceMount` is exposed too, defaulting to `true`. The root turns it on so the
panel outlives the open -> closed boundary and the slide-out can run; passing
`false` unmounts on close and trades that animation away, which is worth it only
for a panel heavy enough to be worth the swap. `Dialog` already offered exactly
this opt-out — the drawer pinning it was an inconsistency, not a decision.

All three are picked from Spar's dialog types alongside the rest of the root's
state.

Existing drawers are untouched: the defaults are the behaviour they already had.
