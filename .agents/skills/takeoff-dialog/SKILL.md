---
name: takeoff-dialog
description:
  'Build a modal Dialog (modal, popup, overlay, confirm/alert dialog, lightbox,
  sheet) — the Dialog from @takeoff-ui/react-spar (Takeoff UI / Spar React).
  Compound API with Trigger, Overlay, Panel, Header, Title, Description, Body,
  Footer, Close, plus intensity/blur backdrop, headerType/footerType styling,
  dismissible and controlled open state. Use this skill WHENEVER building,
  adding, importing, styling, or fixing a Dialog, modal, popup, confirmation, or
  overlay in a React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Dialog — @takeoff-ui/react-spar

`Dialog` wraps Spar's headless dialog primitive and adds Takeoff styling hooks
for overlay intensity, header/footer types, and compound anatomy.

**When to use:** A modal layer that interrupts the flow for content, forms, or
confirmations. Manages focus trapping, the backdrop overlay, and open/close
state. Not this — for transient notifications use a toast/snackbar component
instead.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Dialog } from '@takeoff-ui/react-spar';
```

Examples below also use `Button` from the same package, and `useState` from
`react` for controlled usage.

## Compound parts

- `Dialog` — root; owns open state, `dismissible`, `modal`,
  `open`/`onOpenChange`.
- `Dialog.Trigger` — element that opens the dialog; use `as={Button}` to render
  as a button.
- `Dialog.Overlay` — the backdrop; supports `intensity`, `blur`, `invisible`.
- `Dialog.Panel` — the portaled content surface (focus trap, ARIA role).
- `Dialog.Header` — header region; styled via `headerType`.
- `Dialog.Title` — accessible label (heading); `level` 1-6.
- `Dialog.Description` — accessible description text.
- `Dialog.Body` — default-spaced content area between header and footer.
- `Dialog.Footer` — action region; styled via `footerType`.
- `Dialog.Close` — closes the dialog; use `as={Button}` to render as a button.

## Basic usage

```tsx
import { Dialog, Button } from '@takeoff-ui/react-spar';

function FlightDialog() {
  return (
    <Dialog>
      <Dialog.Trigger as={Button}>Open Dialog</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Panel>
        <Dialog.Header>
          <Dialog.Title>Flight Details</Dialog.Title>
          <Dialog.Close>✕</Dialog.Close>
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>
            Review your selected flight information before continuing.
          </Dialog.Description>
        </Dialog.Body>
      </Dialog.Panel>
    </Dialog>
  );
}
```

## Examples

### Overlay intensity & behavior

`intensity` controls backdrop strength
(`'lightest' | 'light' | 'base' | 'dark' | 'darkest'`). Add `blur` for a
softened backdrop, or `invisible` to keep the overlay interactive but visually
hidden.

```tsx
<Dialog>
  <Dialog.Trigger as={Button}>Open</Dialog.Trigger>
  <Dialog.Overlay intensity="dark" blur />
  <Dialog.Panel>
    <Dialog.Header>
      <Dialog.Title>Dark blurred overlay</Dialog.Title>
      <Dialog.Close>✕</Dialog.Close>
    </Dialog.Header>
    <Dialog.Body>The backdrop is darkened with a soft blur.</Dialog.Body>
  </Dialog.Panel>
</Dialog>
```

### Header & footer types

`headerType` (`'basic' | 'divided' | 'light' | 'dark' | 'primary'`) and
`footerType` (`'basic' | 'divided' | 'light'`) restyle those regions without
changing the layout.

```tsx
<Dialog>
  <Dialog.Trigger as={Button}>Confirm</Dialog.Trigger>
  <Dialog.Overlay />
  <Dialog.Panel>
    <Dialog.Header headerType="divided">
      <Dialog.Title>Confirm changes</Dialog.Title>
      <Dialog.Close>✕</Dialog.Close>
    </Dialog.Header>
    <Dialog.Body>Apply these changes to your itinerary?</Dialog.Body>
    <Dialog.Footer footerType="light">
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Panel>
</Dialog>
```

### Non-dismissible

Set `dismissible={false}` so Escape and outside clicks do not close the dialog —
the user must use an explicit close action.

```tsx
<Dialog dismissible={false}>
  <Dialog.Trigger as={Button}>Open sticky dialog</Dialog.Trigger>
  <Dialog.Overlay />
  <Dialog.Panel>
    <Dialog.Header headerType="light">
      <Dialog.Title>Dismiss disabled</Dialog.Title>
      <Dialog.Close>✕</Dialog.Close>
    </Dialog.Header>
    <Dialog.Body>
      Escape and outside clicks will not close this dialog. Use the close
      button.
    </Dialog.Body>
  </Dialog.Panel>
</Dialog>
```

### Controlled

Drive open state from outside with `open` + `onOpenChange`.
`Dialog.Close as={Button}` renders the close action as a button.

```tsx
import { useState } from 'react';
import { Dialog, Button } from '@takeoff-ui/react-spar';

function ControlledDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open externally</Button>
      <Dialog open={open} onOpenChange={setOpen} dismissible={false}>
        <Dialog.Overlay />
        <Dialog.Panel>
          <Dialog.Header headerType="light">
            <Dialog.Title>Controlled dialog</Dialog.Title>
            <Dialog.Close>✕</Dialog.Close>
          </Dialog.Header>
          <Dialog.Body>
            This dialog's state is managed in the parent.
          </Dialog.Body>
          <Dialog.Footer className="flex justify-end">
            <Dialog.Close as={Button}>Done</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
```

## Key props

| Prop                         | Type                      | Default   | Notes                                                                     |
| ---------------------------- | ------------------------- | --------- | ------------------------------------------------------------------------- |
| `dismissible`                | `boolean`                 | `true`    | On `Dialog` root. When `false`, Escape and outside clicks don't close it. |
| `open`                       | `boolean`                 | –         | On `Dialog` root. Controlled open state (pair with `onOpenChange`).       |
| `defaultOpen`                | `boolean`                 | `false`   | On `Dialog` root. Uncontrolled initial open state.                        |
| `onOpenChange`               | `(open: boolean) => void` | –         | On `Dialog` root. Fires when open state changes.                          |
| `modal`                      | `boolean`                 | `true`    | On `Dialog` root. Blocks interaction outside the panel.                   |
| `disabled`                   | `boolean`                 | `false`   | On `Dialog` root. Disables all triggers (prevents opening).               |
| `intensity`                  | `DialogOverlayIntensity`  | `'base'`  | On `Dialog.Overlay`. Backdrop strength.                                   |
| `blur`                       | `boolean`                 | `false`   | On `Dialog.Overlay`. Adds backdrop blur.                                  |
| `invisible`                  | `boolean`                 | `false`   | On `Dialog.Overlay`. Mounted but visually hidden.                         |
| `headerType`                 | `DialogHeaderType`        | `'basic'` | On `Dialog.Header`. Header visual treatment.                              |
| `footerType`                 | `DialogFooterType`        | `'basic'` | On `Dialog.Footer`. Footer visual treatment.                              |
| `level`                      | `number`                  | `5`       | On `Dialog.Title`. Heading level 1-6.                                     |
| `trapFocus` / `restoreFocus` | `boolean`                 | `true`    | On `Dialog.Panel`. Focus trapping / restore on close.                     |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Renders with the proper `role`, `aria-labelledby`, and `aria-describedby`
  wiring through Spar.
- Focus is trapped inside the panel while open and restored on close.
- `Dialog.Title` provides the accessible label; `Dialog.Description` provides
  the accessible description.
- `Dialog.Body` provides default content spacing between header and footer.
- Keyboard: Escape closes the dialog (unless `dismissible={false}`); Tab /
  Shift+Tab cycle focus within the content.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/dialog
- Source: `packages/react-spar/src/components/dialog/`
