---
name: takeoff-drawer
description:
  'Slide-in side panel (modal) for navigation menus, detail views, filters, or
  contextual forms — the Drawer from @takeoff-ui/react-spar (Takeoff UI / Spar
  React). Trigger when building or fixing a drawer, side panel, slide-out,
  off-canvas menu, sidebar overlay, filter panel, or detail flyout. Use this
  skill WHENEVER building, adding, importing, styling, or fixing a Drawer (or
  related slide-in/overlay UI) in a React app that uses @takeoff-ui/react-spar /
  Takeoff / Spar.'
---

# Drawer — @takeoff-ui/react-spar

`Drawer` is a slide-in side panel that wraps Spar's Dialog primitive in modal
mode, with a compound API for navigation menus, detail views, filters, or
contextual forms that overlay the page.

**When to use:** Reach for Drawer for content that slides in from an edge and
overlays the page. Not this — use `takeoff-dialog`/modal for centered focus
dialogs, and a plain side `<nav>` for static, non-overlay sidebars.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Drawer } from '@takeoff-ui/react-spar';
```

All sub-parts are attached to `Drawer` (e.g. `Drawer.Panel`). The `Button` used
in `as={Button}` triggers also comes from `@takeoff-ui/react-spar`.

## Compound parts

- `Drawer` — root; owns open state, `placement`, and `dismissible`.
- `Drawer.Trigger` — element that opens the drawer; use `as={Button}` to render
  a Takeoff button.
- `Drawer.Overlay` — backdrop; supports `intensity`, `blur`, `invisible`.
- `Drawer.Panel` — the sliding surface; handles focus trap/restore.
- `Drawer.Header` — header region; `headerType` variants.
- `Drawer.Title` — accessible label (`aria-labelledby`); `level` sets heading
  tag.
- `Drawer.Description` — accessible description (`aria-describedby`).
- `Drawer.Body` — scrollable main content.
- `Drawer.Footer` — footer actions; `footerType` variants.
- `Drawer.Close` — closes the drawer (renders its children as the control).

## Basic usage

```tsx
import { Drawer, Button } from '@takeoff-ui/react-spar';

function FlightDrawer() {
  return (
    <Drawer placement="right">
      <Drawer.Trigger as={Button}>Open Drawer</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Panel>
        <Drawer.Header>
          <Drawer.Title>Flight Details</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Drawer.Description>
            Review your selected flight information and passenger details before
            confirming the booking.
          </Drawer.Description>
        </Drawer.Body>
      </Drawer.Panel>
    </Drawer>
  );
}
```

## Examples

### Placement

`placement` controls which edge the drawer slides in from: `left`, `right`,
`top`, or `bottom`.

```tsx
<Drawer placement="left">
  <Drawer.Trigger as={Button}>Open from left</Drawer.Trigger>
  <Drawer.Overlay />
  <Drawer.Panel>
    <Drawer.Header>
      <Drawer.Title>Menu</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body>This drawer slides in from the left side.</Drawer.Body>
  </Drawer.Panel>
</Drawer>
```

### Full screen

Stretch `Drawer.Panel` to the viewport with a style override. `placement` still
decides which edge the panel slides in from.

```tsx
<Drawer placement="right">
  <Drawer.Trigger as={Button}>Open full screen</Drawer.Trigger>
  <Drawer.Overlay />
  <Drawer.Panel
    style={{
      inset: 0,
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: 0,
    }}
  >
    <Drawer.Header headerType="divided">
      <Drawer.Title>Full-screen drawer</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body>
      Stretched to the viewport, still slides in from the right.
    </Drawer.Body>
  </Drawer.Panel>
</Drawer>
```

Do not override `transform` — the recipe drives the open/close slide through it.

### Footer actions

`Drawer.Footer` accepts `footerType` of `basic` (default), `divided`, or
`light`.

```tsx
<Drawer placement="right">
  <Drawer.Trigger as={Button}>Edit profile</Drawer.Trigger>
  <Drawer.Overlay />
  <Drawer.Panel>
    <Drawer.Header headerType="divided">
      <Drawer.Title>Edit profile</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body>Form fields go here.</Drawer.Body>
    <Drawer.Footer footerType="divided">
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </Drawer.Footer>
  </Drawer.Panel>
</Drawer>
```

### Controlled & non-dismissible

Control open state with `open` + `onOpenChange`. Set `dismissible={false}` so
outside-click and Escape don't close it (only `Drawer.Close` does). Needs
`import { useState } from 'react'`.

```tsx
import { useState } from 'react';
import { Drawer, Button } from '@takeoff-ui/react-spar';

function StickyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      dismissible={false}
      placement="right"
    >
      <Drawer.Trigger as={Button}>Open non-dismissible</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Panel>
        <Drawer.Header>
          <Drawer.Title>Sticky Drawer</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          This drawer can only be closed using the close control.
        </Drawer.Body>
      </Drawer.Panel>
    </Drawer>
  );
}
```

### Overlay appearance

Tune the backdrop with `intensity` (`lightest` → `darkest`), `blur`, or
`invisible` (mounted but visually hidden, stays interactive).

```tsx
<Drawer placement="right">
  <Drawer.Trigger as={Button}>Blurred backdrop</Drawer.Trigger>
  <Drawer.Overlay blur intensity="dark" />
  <Drawer.Panel>
    <Drawer.Header>
      <Drawer.Title>Blurred overlay</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body>The backdrop adds a soft blur behind the panel.</Drawer.Body>
  </Drawer.Panel>
</Drawer>
```

## Key props

| Prop           | Type                                                     | Default    | Notes                                                                |
| -------------- | -------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| `placement`    | `'left' \| 'right' \| 'top' \| 'bottom'`                 | —          | Edge the panel slides in from (on `Drawer`).                         |
| `dismissible`  | `boolean`                                                | `true`     | When false, outside-click/Escape won't close (on `Drawer`).          |
| `modal`        | `boolean`                                                | `true`     | When false, page stays scrollable and clickable behind it.           |
| `open`         | `boolean`                                                | —          | Controlled open state (on `Drawer`).                                 |
| `defaultOpen`  | `boolean`                                                | `false`    | Uncontrolled initial open state (on `Drawer`).                       |
| `onOpenChange` | `(open: boolean) => void`                                | —          | Fires when open state changes (on `Drawer`).                         |
| `disabled`     | `boolean`                                                | `false`    | Disables triggers, preventing opening (on `Drawer`).                 |
| `headerType`   | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'` | `'basic'`  | On `Drawer.Header`.                                                  |
| `footerType`   | `'basic' \| 'divided' \| 'light'`                        | `'basic'`  | On `Drawer.Footer`.                                                  |
| `intensity`    | `'lightest' \| 'light' \| 'base' \| 'dark' \| 'darkest'` | `'base'`   | On `Drawer.Overlay`.                                                 |
| `blur`         | `boolean`                                                | `false`    | Backdrop blur, on `Drawer.Overlay`.                                  |
| `invisible`    | `boolean`                                                | `false`    | Overlay rendered but visually hidden, on `Drawer.Overlay`.           |
| `level`        | `number`                                                 | `5`        | Heading tag (h1–h6) for `Drawer.Title`; visual size fixed.           |
| `role`         | `React.AriaRole`                                         | `'dialog'` | ARIA role on `Drawer.Panel`; use `'alertdialog'` when it interrupts. |
| `forceMount`   | `boolean`                                                | `true`     | Keeps the panel mounted while closed so the slide-out can run.       |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Renders as a modal `role="dialog"` with `aria-labelledby` / `aria-describedby`
  wired to `Drawer.Title` and `Drawer.Description`.
- Focus is trapped inside the panel while open and restored to the trigger on
  close (`Drawer.Panel` supports `trapFocus`, `restoreFocus`, `initialFocus`,
  `finalFocus`).
- Escape closes the drawer; Tab / Shift+Tab cycle focus within the panel.
- With `dismissible={false}`, Escape and outside clicks do not close the drawer.
- `modal={false}` leaves the page live behind the panel — no focus trap, no
  scroll lock. Omit `Drawer.Overlay` with it: the overlay is what swallows
  pointer events, so the page is only interactive once both are gone. Use it for
  a drawer that inspects something still on screen; keep the default for one
  that interrupts.
- `forceMount={false}` unmounts the panel on close. The slide-out animation runs
  off `data-state='closed'` on a mounted element, so turning it off trades that
  animation away — worth it only for a panel heavy enough that keeping it in the
  DOM costs more than the transition is worth.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/drawer
- Source: `packages/react-spar/src/components/drawer/`
