---
'@takeoff-ui/react-spar': minor
---

`Drawer` accepts `modal`, defaulting to `true`.

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

Existing drawers are untouched: the default is the behaviour they already had.
