---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Drawer: rename the `dismissable` prop and the `Drawer.CloseButton` part, and add
an opt-in `blur` prop to `Drawer.Overlay`.

> **Heads-up for consumers — these are breaking renames.** They are released as
> `minor` (not `major`) on purpose while the library has a single consumer, to
> avoid churning the major version during this phase. A find-and-replace covers
> the migration:
>
> - **Prop:** `<Drawer dismissable={false}>` → `<Drawer dismissible={false}>`
> - **Part:** `<Drawer.CloseButton>` → `<Drawer.Close>`
> - **Type:** `DrawerCloseButtonProps` → `DrawerCloseProps`
> - **CSS class:** `.tk-drawer-close-button` → `.tk-drawer-close`
>
> New: `<Drawer.Overlay blur />` adds a soft backdrop blur (emits `data-blur`).
