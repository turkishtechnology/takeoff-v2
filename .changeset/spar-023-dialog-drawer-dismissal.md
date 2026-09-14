---
'@takeoff-ui/react-spar': patch
---

`Dialog` and `Drawer` honour `dismissible={false}` for Escape, and closing
returns focus to the trigger.

Both were Spar bugs, fixed upstream in `@turkish-technology/spar@0.2.3`, which
this release pins.

`Dialog.Panel` and `Drawer.Panel` already blocked the dismissal by calling
`preventDefault()` on the event Spar hands to `onEscapeKeyDown`, but Spar read
the veto from the React event, which never sees a `preventDefault()` made on the
native one. Escape therefore closed a non-dismissible dialog or drawer, and a
consumer's own `onEscapeKeyDown` veto was ignored too. Spar also cleared the
stored trigger before its root could restore focus, so `restoreFocus` (on by
default) never moved focus back on close.
