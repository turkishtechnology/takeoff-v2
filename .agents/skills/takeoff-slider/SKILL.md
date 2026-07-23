---
name: takeoff-slider
description:
  'Build a Slider — the Slider from @takeoff-ui/react-spar (Takeoff UI / Spar
  React) for picking a number, or a [min, max] range, from a continuous scale by
  dragging or with the keyboard. Trigger contexts: range slider, price range,
  volume/brightness/temperature control, min-max filter, dual-handle / two-thumb
  slider, multi-handle slider, tick marks, vertical slider, slider synced with a
  number input. Use this skill WHENEVER building, adding, importing, styling, or
  fixing a Slider / range input (or a Field-wrapped numeric range control) in a
  React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Slider — @takeoff-ui/react-spar

`Slider` picks a number — or a `[min, max]` range — from a continuous scale. It
is a **standalone** component (no upstream Spar primitive), so the wrapper owns
the value math, pointer dragging, and the full keyboard + ARIA surface. Each
thumb is its own `role="slider"` element — that is what assistive tech reads and
what the arrow keys drive.

**When to use:** Any bounded numeric selection where dragging beats typing —
volume, brightness, temperature, zoom, a price/date range filter, gradient
stops. Wrap it in `Field` to attach a label, description, or error, and to
cascade `disabled` / `readOnly` / `invalid` / `required`. Not this — use
`takeoff-input` (`type="number"`) for exact entry, `takeoff-progress` for a
non-interactive completion bar.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Field, Slider } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Slider.Track` — the rail the thumbs travel along; owns press-to-seek.
- `Slider.Range` — the filled portion of the rail (offset + length written
  inline from the committed values).
- `Slider.Thumb` — the draggable handle and `role="slider"` a11y owner
  (keyboard, ARIA value, focus). Renders the value bubble; `children` replace
  its content. Compose by hand with `index` / `disabled` per thumb.
- `Slider.Ticks` — opt-in decorative marks at every step; compose it **after**
  `Slider.Track`.
- `Slider.Value` — opt-in decorative value readout (`aria-hidden`); function
  children are the only way to read an **uncontrolled** slider's value.

Children are optional. Omitting them renders the default anatomy —
`Slider.Track` wrapping `Slider.Range` and one thumb per value. Compose the
parts explicitly only to add an indicator (ticks), a readout, or per-part
styling.

## Basic usage

```tsx
// Uncontrolled, zero-config — renders the default anatomy.
<Slider defaultValue={40} />
```

## Examples

### Controlled

```tsx
import { useState } from 'react';

function CabinTemp() {
  const [value, setValue] = useState(22);
  return (
    <Field>
      <Field.Label>Cabin temperature</Field.Label>
      <Slider
        value={value}
        onValueChange={setValue}
        min={16}
        max={28}
        step={0.5}
        formatValue={v => `${v}°C`}
      />
    </Field>
  );
}
```

### Range (two thumbs)

`range` turns the value into a `[min, max]` tuple; `onValueChange` reports the
same shape. Dragging one handle past the other swaps them, so the committed
tuple stays ascending.

```tsx
const [price, setPrice] = useState([250, 900]);

<Field>
  <Field.Label>Price range</Field.Label>
  <Slider
    range
    value={price}
    onValueChange={setPrice}
    min={0}
    max={1200}
    step={50}
    formatValue={v => `$${v}`}
  />
</Field>;
```

### Multiple handles

The thumb count comes from the value array's length, not a separate prop — three
entries render three handles, each bounded by its neighbours. Outer handles keep
`data-thumb="min"` / `"max"`; middle handles carry none. A two-handle range
reads as _Minimum_ / _Maximum_; three or more fall back to _Value 1_, _Value 2_,
… (override per thumb with `aria-label`).

```tsx
const [stops, setStops] = useState([20, 50, 80]);
<Slider
  range
  value={stops}
  onValueChange={setStops}
  min={0}
  max={100}
  step={5}
/>;
```

### Minimum distance

```tsx
// Handles keep a 20-unit gap and can no longer cross. Seed initial values at
// least this far apart — they are not reshaped.
<Slider range defaultValue={[30, 70]} min={0} max={100} minDistance={20} />
```

### Change events

`onValueChange` fires on every committed change while interacting (each drag
frame, keystroke, track press). `onValueChangeEnd` fires once when the
interaction settles — use it to persist / refetch / validate the settled value.

```tsx
<Slider defaultValue={40} onValueChange={setLive} onValueChangeEnd={persist} />
```

### Ticks

The default anatomy is the track alone. To mark the step grid, compose
`Slider.Ticks` after `Slider.Track` — an indicator is anatomy, added by
composition rather than a prop.

```tsx
<Slider defaultValue={60} min={0} max={100} step={20}>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb />
  </Slider.Track>
  <Slider.Ticks />
</Slider>
```

### Value tooltip

The value bubble follows the handle on drag / focus by default
(`tooltip="auto"`). `tooltip="always"` pins it open; `tooltip="never"` hides it
(useful when a `Slider.Value` already shows the number). A disabled slider hides
it regardless.

```tsx
<Slider tooltip="never" defaultValue={70} formatValue={v => `${v}%`}>
  <div className="mb-2 flex items-baseline justify-between">
    <Field.Label>Muted bubble</Field.Label>
    <Slider.Value className="text-sm font-semibold" />
  </div>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb />
  </Slider.Track>
</Slider>
```

### Track fill

`track` sets how the rail fills. `normal` (default) fills start→thumb (or
between a range's handles); `inverted` fills the complement; `none` drops the
fill, leaving just the rail and thumbs.

```tsx
<Slider defaultValue={35} track="inverted" />
<Slider defaultValue={60} track="none" />
```

### Orientation

`orientation="vertical"` runs the rail bottom-to-top (bottom edge is `min`). A
vertical rail has **no intrinsic length** — give the slider (or a wrapper) a
height, or it collapses.

```tsx
<Slider orientation="vertical" style={{ height: 220 }} defaultValue={60} />
```

### Sizes & variants

```tsx
<Slider defaultValue={40} size="small" />   {/* small | base | large */}
<Slider defaultValue={70} variant="success" />
{/* primary | info | success | warning | danger */}
```

### Field state (disabled / readOnly / invalid) + per-thumb disable

```tsx
<Field invalid>
  <Field.Label>Threshold</Field.Label>
  <Slider value={level} onValueChange={setLevel} />
  <Field.ErrorMessage>Pick a value under 50.</Field.ErrorMessage>
</Field>;

{
  /* Disable one handle only — the other stays interactive. */
}
<Slider range defaultValue={[30, 70]}>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} disabled />
    <Slider.Thumb index={1} />
  </Slider.Track>
</Slider>;
```

### Sync with a number input

The slider is controlled like any input — bind `value` / `onValueChange` to
state and pair it with an `Input type="number"` for exact entry: typing moves
the thumb, dragging updates the field.

### Custom styling

Every part accepts `className`, `classNames`, `style`, and `slotProps`, so the
whole slider is re-skinnable in place: the rail (`Slider.Track`), the fill
(`Slider.Range`), the handle (`Slider.Thumb`, whose slots are `root` / `tooltip`
/ `arrow`), plus the bubble content via a `Slider.Thumb` child. The bubble and
its arrow share `--tk-slider-tooltip-bg` (one override recolours both); the
arrow keeps its own `--tk-slider-arrow-width` / `-height`.

### Form submission

```tsx
// A single slider submits one entry under `name`; a two-handle range submits
// `<name>-min` / `<name>-max`; more handles submit `<name>-1`, `<name>-2`, …
<Slider name="budget" defaultValue={500} />
<Slider range name="window" defaultValue={[9, 17]} />
```

## Key props

| Prop                                             | Type                                                        | Default             | Notes                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `range`                                          | `boolean`                                                   | `false`             | Multi-handle mode; value becomes an array (two thumbs by default).                 |
| `value`                                          | `number \| number[]`                                        | -                   | Controlled value; array shape when `range`. Clamped, snapped to `step`, ascending. |
| `defaultValue`                                   | `number \| number[]`                                        | `min` / `[min,max]` | Uncontrolled initial value. Mode latched on first render.                          |
| `onValueChange`                                  | `(value: number \| number[]) => void`                       | -                   | Every committed change while interacting.                                          |
| `onValueChangeEnd`                               | `(value: number \| number[]) => void`                       | -                   | Once when the interaction settles — persist/refetch here.                          |
| `min` / `max`                                    | `number`                                                    | `0` / `100`         | Scale bounds. `max <= min` falls back to `min + 100` (dev warning).                |
| `step`                                           | `number`                                                    | `1`                 | Snap granularity from `min`.                                                       |
| `minDistance`                                    | `number`                                                    | `0`                 | Min gap between adjacent range handles; they can no longer cross.                  |
| `orientation`                                    | `'horizontal' \| 'vertical'`                                | `'horizontal'`      | Vertical needs an explicit height.                                                 |
| `size`                                           | `'small' \| 'base' \| 'large'`                              | `'base'`            | Rail thickness + thumb diameter.                                                   |
| `variant`                                        | `'primary' \| 'info' \| 'success' \| 'danger' \| 'warning'` | `'primary'`         | Fill color.                                                                        |
| `track`                                          | `'normal' \| 'inverted' \| 'none'`                          | `'normal'`          | Rail fill mode.                                                                    |
| `tooltip`                                        | `'auto' \| 'always' \| 'never'`                             | `'auto'`            | When the value bubble shows.                                                       |
| `formatValue`                                    | `(value: number) => string`                                 | -                   | Formats every readout (tooltip, `Slider.Value`, `aria-valuetext`).                 |
| `disabled` / `readOnly` / `invalid` / `required` | `boolean`                                                   | `false`             | Inherited from `Field`; pass only to override.                                     |
| `name` / `form`                                  | `string`                                                    | -                   | Native form submission (see Form submission).                                      |
| `classNames` / `slotProps`                       | `Partial<Record<SliderSlot, …>>`                            | -                   | Per-slot overrides (`root`).                                                       |

Full props, events, data attributes, per-part APIs & type definitions: see
`references/full-docs.md`.

## Accessibility

- Each `Slider.Thumb` is the a11y owner: `role="slider"` carrying
  `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, plus the keyboard
  surface. A `range` root adds `role="group"` to tie the thumbs together under
  the `Field` label.
- Compose inside `Field` so `Field.Label` / `Field.Description` /
  `Field.ErrorMessage` wire via shared IDs; without a visible label, pass
  `aria-label` on the thumb. `formatValue` also feeds `aria-valuetext`.
- Disabled slider leaves the tab order; read-only stays focusable but does not
  change value. In a range each thumb is bounded by its neighbour, so the
  keyboard can never push one past the other.

| Key         | Action                                       |
| ----------- | -------------------------------------------- |
| `←` `↓`     | Decrease the focused thumb by one `step`     |
| `→` `↑`     | Increase the focused thumb by one `step`     |
| `Page Down` | Decrease by ten steps                        |
| `Page Up`   | Increase by ten steps                        |
| `Home`      | Jump to the lowest value the thumb may take  |
| `End`       | Jump to the highest value the thumb may take |

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/slider
- Source: `packages/react-spar/src/components/slider/`
- Spar primitive: none — Slider is a standalone takeoff-spar component.
