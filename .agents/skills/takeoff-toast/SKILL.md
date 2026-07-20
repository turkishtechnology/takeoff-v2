---
name: takeoff-toast
description:
  "Transient notification/toast system (queue, timers, pause-on-idle, promise
  toasts) — the Toaster + createToaster controller from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Use WHENEVER building, adding, importing, styling,
  or fixing a toast, toaster, snackbar, notification, flash message, 'show
  success/error message', undo toast, or async/promise feedback in a React app
  that uses @takeoff-ui/react-spar / Takeoff / Spar."
---

# Toast — @takeoff-ui/react-spar

`Toast` shows transient feedback without interrupting the workflow; a
`createToaster` controller owns the queue, timers, pause/resume, hotkey focus,
and live-region semantics, while `<Toaster>` renders each item with Takeoff
Alert anatomy by default.

**When to use:** Any ephemeral, auto-dismissing notification fired imperatively
(success/error/info/warning/loading, promise results, undo actions). Not for
persistent inline status banners on the page — for those use an Alert component
instead.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { createToaster, Toaster, Toast } from '@takeoff-ui/react-spar';
```

Create one controller (module scope or a ref) and mount its `<Toaster>` once;
call its methods from anywhere.

## Basic usage

```tsx
import { createToaster, Toaster } from '@takeoff-ui/react-spar';

const toaster = createToaster({ placement: 'bottom-end' });

function App() {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toaster.success({
            title: 'Booking saved',
            description: 'Passenger details were updated successfully.',
          })
        }
      >
        Save
      </button>
      <Toaster toaster={toaster} />
    </>
  );
}
```

Controller methods: `create`, `success`, `error`, `warning`, `info`, `loading`
(each returns the toast `id`), plus `update(id, opts)`, `dismiss(id?)`,
`pause(id?)`, `resume(id?)`, `clear()`, `destroy()`, and `promise(...)`.

## Examples

### Semantic types

`type` sets the intent; React Spar maps it to the matching Alert variant (no
separate `variant` prop). Use the shortcut methods or `create({ type })`.

```tsx
toaster.success({ title: 'Saved' });
toaster.error({ title: 'Failed', description: 'Please try again.' });
toaster.warning({ title: 'Heads up' });
toaster.info({ title: 'FYI' });
toaster.create({ type: 'default', title: 'Neutral' }); // default | success | info | warning | error | loading
```

### Appearance

`appearance` on `<Toaster>` styles the default renderer:
`'filled' | 'filledLight' | 'outlined' | 'gradient'`.

```tsx
const toaster = createToaster({ placement: 'top-end' });
// ...
<Toaster toaster={toaster} appearance="outlined" />;
```

### Persistent toast + external dismiss

Pass `duration: null` to keep a toast open until dismissed; capture the returned
id to close it later.

```tsx
import { useState } from 'react';
const toaster = createToaster({ placement: 'top-end' });

function PersistentDemo() {
  const [toastId, setToastId] = useState(null);

  const show = () =>
    setToastId(
      toaster.info({ title: 'Manual review required', duration: null }),
    );

  return (
    <div>
      <button type="button" onClick={show}>
        Show toast
      </button>
      <button
        type="button"
        disabled={!toastId}
        onClick={() => {
          toaster.dismiss(toastId);
          setToastId(null);
        }}
      >
        Close from outside
      </button>
      <button type="button" onClick={() => toaster.dismiss()}>
        Dismiss all
      </button>
      <Toaster toaster={toaster} />
    </div>
  );
}
```

### Promise toasts

`toaster.promise` swaps a loading toast for success/error automatically;
`success`/`error` accept either an options object or a `(data) => options`
function.

```tsx
toaster.promise(saveBooking(), {
  loading: {
    title: 'Saving booking',
    description: 'Passenger details are being updated.',
  },
  success: booking => ({
    title: 'Booking saved',
    description: `PNR ${booking.pnr} is ready.`,
  }),
  error: {
    title: 'Booking could not be saved',
    description: 'Please try again.',
  },
});
```

### Update an existing toast

```tsx
const id = toaster.loading({
  title: 'Draft created',
  description: 'Waiting for the next update.',
});
toaster.update(id, { title: 'Draft saved', type: 'success', duration: 3000 }); // later
```

### Custom rendering

Pass a render function as `<Toaster>` children and render `<Toast>` yourself;
read arbitrary payload from `toast.data`.

```tsx
// Fire with a payload: toaster.info({ title: 'TK 1845', duration: null, data: { gate: 'A12' } });
<Toaster toaster={toaster}>
  {toast => (
    <Toast
      toast={toast}
      toaster={toaster}
      className="w-full max-w-sm rounded-lg border p-4"
    >
      <strong>{toast.title}</strong>
      <p>{toast.description}</p>
      <span>Gate {toast.data?.gate}</span>
      <button type="button" onClick={() => toaster.dismiss(toast.id)}>
        Dismiss
      </button>
    </Toast>
  )}
</Toaster>
```

## Key props

`<Toaster>` props:

| Prop         | Type                                                    | Default                  | Notes                                          |
| ------------ | ------------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| `toaster`    | `ToasterController`                                     | –                        | Controller from `createToaster` (required).    |
| `appearance` | `'filled' \| 'filledLight' \| 'outlined' \| 'gradient'` | `'filled'`               | Default toast visual style.                    |
| `overlap`    | `boolean`                                               | `false`                  | Stacks visible toasts; expands on hover/focus. |
| `closeLabel` | `string`                                                | `'Dismiss notification'` | Accessible label for the close control.        |
| `label`      | `string`                                                | `'Notifications (F8)'`   | Accessible label for the viewport region.      |
| `hotkey`     | `string[]`                                              | `['F8']`                 | Keys that focus the toast viewport.            |
| `children`   | render fn `(toast) => ReactNode`                        | –                        | Optional custom per-toast renderer.            |

`createToaster(options)` and per-toast options:

| Option                  | Type                 | Default        | Notes                                                        |
| ----------------------- | -------------------- | -------------- | ------------------------------------------------------------ |
| `placement`             | `ToastPlacement`     | `'bottom-end'` | `top`/`bottom` + optional `-start`/`-end`.                   |
| `duration`              | `number \| null`     | `5000`         | Auto-dismiss ms; `null` = persistent. Settable per toast.    |
| `maxVisibleToasts`      | `number`             | `24`           | Max visible at once; extras stay queued.                     |
| `pauseOnPageIdle`       | `boolean`            | `false`        | Pause timers while the tab is hidden.                        |
| `title` / `description` | `ReactNode`          | –              | Toast content (per call).                                    |
| `type`                  | `ToastType`          | –              | `default \| success \| info \| warning \| error \| loading`. |
| `action`                | `{ label, altText }` | –              | Optional action affordance.                                  |
| `data`                  | `unknown`            | –              | Arbitrary payload for custom rendering.                      |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- The viewport is an `aria-live` region; toasts are announced without stealing
  focus.
- Press the `hotkey` (default `F8`) to move focus into the toast viewport;
  `label` names that region.
- Each toast's default close control is labelled by `closeLabel`.
- Timers pause on hover/focus (and on page idle when `pauseOnPageIdle` is
  enabled), giving users time to read and act.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/toast
- Source: `packages/react-spar/src/components/toast/`
