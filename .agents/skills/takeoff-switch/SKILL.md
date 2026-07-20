---
name: takeoff-switch
description:
  'Build an on/off Switch (toggle) — the Switch from @takeoff-ui/react-spar
  (Takeoff UI / Spar React) for turning a single setting, preference,
  permission, or form option on or off. Trigger contexts: toggle switch, on/off
  toggle, settings toggle, enable/disable control, notifications toggle, feature
  flag UI. Use this skill WHENEVER building, adding, importing, styling, or
  fixing a Switch / toggle (or related Field-wrapped boolean control) in a React
  app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Switch — @takeoff-ui/react-spar

`Switch` lets users turn a single setting on or off (preferences, permissions,
form options); the root owns visual state and `Switch.Indicator` renders the
track plus sliding thumb.

**When to use:** Any boolean toggle that applies immediately. Wrap it in `Field`
to attach a label, description, or error message — field-level state
(`invalid`/`disabled`/`required`/`optional`/`readOnly`) cascades into the
switch. Not this — use `takeoff-checkbox` for multi-select lists or form values
that commit on submit rather than instantly.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Field, Switch } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Switch.Indicator` — the track + sliding thumb slot. Accepts function children
  receiving `{ checked, disabled, readOnly }`, or a `ReactNode` that replaces
  the default `thumb` slot.

## Basic usage

```tsx
<Field className="max-w-90">
  <div className="flex w-full items-center justify-between">
    <div>
      <Field.Label>Flight status alerts</Field.Label>
      <Field.Description>
        We will let you know about delays, gate changes, and cancellations.
      </Field.Description>
    </div>
    <Switch defaultChecked>
      <Switch.Indicator />
    </Switch>
  </div>
</Field>
```

## Examples

### Controlled

```tsx
import { useState } from 'react';

function NotificationToggle() {
  const [enabled, setEnabled] = useState(true);

  return (
    <Field>
      <div className="flex w-full items-center justify-between">
        <Field.Label>Flight status notifications</Field.Label>
        <Switch checked={enabled} onChange={setEnabled}>
          <Switch.Indicator />
        </Switch>
      </div>
    </Field>
  );
}
```

### Sizes

```tsx
<div className="flex flex-wrap items-center gap-3">
  <Switch aria-label="Extra small switch" size="xsmall">
    <Switch.Indicator />
  </Switch>
  <Switch aria-label="Small switch" size="small">
    <Switch.Indicator />
  </Switch>
  <Switch aria-label="Base switch" size="base" defaultChecked>
    <Switch.Indicator />
  </Switch>
  <Switch aria-label="Large switch" size="large" defaultChecked>
    <Switch.Indicator />
  </Switch>
  <Switch aria-label="Extra large switch" size="xlarge" defaultChecked>
    <Switch.Indicator />
  </Switch>
</div>
```

### Variants

```tsx
<Field>
  <div className="flex w-full items-center justify-between">
    <Field.Label>Auto check-in</Field.Label>
    <Switch defaultChecked variant="success">
      <Switch.Indicator />
    </Switch>
  </div>
</Field>
```

### Field state (invalid / disabled / readOnly)

```tsx
<Field invalid>
  <div className="flex w-full items-center justify-between">
    <div>
      <Field.Label>Push notifications</Field.Label>
      <Field.ErrorMessage>
        Enable browser notifications to turn this on.
      </Field.ErrorMessage>
    </div>
    <Switch>
      <Switch.Indicator />
    </Switch>
  </div>
</Field>
```

### Custom indicator (per-state content)

```tsx
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { BlockIconOutlinedRounded } from '@takeoff-icons/react/block';

<Switch defaultChecked variant="success">
  <Switch.Indicator>
    {({ checked }) => (
      <span
        data-slot="thumb"
        className="tk-toggle-thumb inline-flex items-center justify-center"
      >
        {checked ? (
          <CheckIconOutlinedRounded width={20} height={20} />
        ) : (
          <BlockIconOutlinedRounded width={20} height={20} />
        )}
      </span>
    )}
  </Switch.Indicator>
</Switch>;
```

### Form submission

```tsx
// With `name` set, Spar renders a synchronized hidden checkbox for native submission.
<Switch name="email" value="enabled" defaultChecked>
  <Switch.Indicator />
</Switch>
```

## Key props

| Prop             | Type                                                   | Default  | Notes                                                            |
| ---------------- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------- |
| `checked`        | `boolean`                                              | -        | Controlled checked state.                                        |
| `defaultChecked` | `boolean`                                              | -        | Uncontrolled initial checked state.                              |
| `onChange`       | `(checked: boolean) => void`                           | -        | Fires on toggle.                                                 |
| `size`           | `'xsmall' \| 'small' \| 'base' \| 'large' \| 'xlarge'` | `'base'` | Size scale.                                                      |
| `variant`        | `'info' \| 'success'`                                  | `'info'` | Color variant while checked.                                     |
| `invalid`        | `boolean`                                              | `false`  | Visually invalid; inherited from `Field`, pass only to override. |
| `name`           | `string`                                               | -        | Form field name; renders hidden checkbox for native submit.      |
| `value`          | `string`                                               | -        | Submitted value when checked.                                    |
| `aria-label`     | `string`                                               | -        | Use when there is no visible `Field.Label`.                      |
| `classNames`     | `Partial<Record<SwitchSlot, string>>`                  | -        | Per-slot class overrides (`root`/`indicator`/`thumb`).           |
| `children`       | `ReactNode \| (state: SwitchRenderProps) => ReactNode` | -        | Anatomy or render function exposing Spar state.                  |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Switch` renders a focusable control with `role="switch"` and reflects value
  via `aria-checked`.
- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` wire to the
  control through shared IDs (`aria-labelledby`, `aria-describedby`,
  `aria-invalid`).
- With no visible label (e.g. a size sampler), pass `aria-label` directly on
  `<Switch>`.
- Disabled switches leave the tab order; read-only switches stay focusable but
  do not change value.
- Keyboard: Enter / Space toggles the focused switch; Tab moves to the next
  tabbable UI.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/switch
- Source: `packages/react-spar/src/components/switch/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Switch
