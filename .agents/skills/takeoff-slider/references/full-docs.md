# Slider

`Slider` picks a number — or a `[min, max]` range — from a continuous scale. It
is a standalone component (no upstream Spar primitive), so the wrapper owns the
value math, the pointer dragging, and the full keyboard and ARIA surface. Each
thumb is its own `role="slider"` element, which is what assistive technology
reads and what the arrow keys drive.

## Usage

```tsx
import { Slider } from '@takeoff-ui/react-spar';
```

```tsx
<Slider>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb />
  </Slider.Track>
  <Slider.Ticks />
  <Slider.Value />
</Slider>
```

Compose it inside a `Field` to wire the visible label, the description, and the
shared `disabled` / `readOnly` / `invalid` / `required` state automatically.
When `children` are omitted, `Slider` renders the default anatomy —
`Slider.Track` wrapping `Slider.Range` and one thumb per value.

## Playground

```tsx
function PlaygroundDemo() {
  const [value, setValue] = React.useState(22);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Cabin temperature</Field.Label>

        <Slider
          value={value}
          onValueChange={setValue}
          min={16}
          max={28}
          step={0.5}
          formatValue={v => v + '°C'}
        >
          {/* The root stacks its children; this row puts the readout
              beside the rail, with the scale bounds under it. */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Slider.Track>
                <Slider.Range />
                <Slider.Thumb />
              </Slider.Track>
            </div>
            <Slider.Value className="min-w-16" />
          </div>
        </Slider>
      </Field>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Range

Set `range` to render two thumbs. The value becomes a `[min, max]` tuple, and
`onValueChange` reports it in the same shape. Dragging one handle past the other
swaps them, so the committed tuple always stays ascending.

```tsx
function RangeDemo() {
  const [price, setPrice] = React.useState([250, 900]);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Price range</Field.Label>
        <Slider
          range
          value={price}
          onValueChange={setPrice}
          min={0}
          max={1200}
          step={50}
          formatValue={v => '$' + v}
        />
      </Field>
    </div>
  );
}

render(<RangeDemo />);
```

## Multiple handles

The number of thumbs is decided by the value array, not by a separate prop: pass
three entries and three handles render, each bounded by its neighbours.
`onValueChange` reports the whole array, ordered ascending.

The outer handles keep the `data-thumb="min"` / `"max"` styling hooks; a handle
in between is neither, so it carries no `data-thumb` at all. Accessible names
follow the same logic — a two-handle range reads as _Minimum_ / _Maximum_, while
three or more fall back to _Value 1_, _Value 2_, … which consumers can override
per thumb with `aria-label`.

```tsx
function MultiThumbDemo() {
  const [stops, setStops] = React.useState([20, 50, 80]);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Gradient stops</Field.Label>
        <Slider
          range
          value={stops}
          onValueChange={setStops}
          min={0}
          max={100}
          step={5}
          formatValue={v => v + '%'}
        />
        <Field.Description>Committed: {stops.join(' · ')}</Field.Description>
      </Field>
    </div>
  );
}

render(<MultiThumbDemo />);
```

## Minimum distance

Set `minDistance` to keep a gap between adjacent range handles. With a positive
gap the handles can no longer cross — dragging one into another stops it against
its neighbour instead of swapping. Seed the initial values at least this far
apart; they are not reshaped.

```tsx
function MinDistanceDemo() {
  const [range, setRange] = React.useState([30, 70]);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Allowed window</Field.Label>
        {/* minDistance keeps the handles at least 20 apart — they clamp against
            each other instead of crossing. */}
        <Slider
          range
          value={range}
          onValueChange={setRange}
          min={0}
          max={100}
          minDistance={20}
          formatValue={v => v + '%'}
        />
        <Field.Description>
          {range[0]}% – {range[1]}% (gap {range[1] - range[0]})
        </Field.Description>
      </Field>
    </div>
  );
}

render(<MinDistanceDemo />);
```

## Sync with an input

The slider is controlled like any input — bind `value` / `onValueChange` to
state and pair it with a number field for exact entry. Typing moves the thumb;
dragging updates the field.

```tsx
function InputDemo() {
  const [value, setValue] = React.useState(40);
  const clamp = n => Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0));

  return (
    <div className="w-full max-w-md">
      <Field>
        <div className="mb-2 flex items-center justify-between gap-4">
          <Field.Label>Quantity</Field.Label>
          {/* Input and slider share one state: typing or stepping moves the
              thumb, and dragging updates the field. The stepper dispatches a
              native input event, so the controlled onChange picks it up too.
              Sized with a wrapper because .tk-input is width:100%. */}
          <div className="w-28">
            <Input size="small">
              <Input.Field
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={value}
                onChange={e => setValue(clamp(Number(e.target.value)))}
              />
              <Input.Stepper>
                <Input.Decrement />
                <Input.Increment />
              </Input.Stepper>
            </Input>
          </div>
        </div>
        <Slider value={value} onValueChange={setValue} min={0} max={100} />
      </Field>
    </div>
  );
}

render(<InputDemo />);
```

## Change events

`onValueChange` fires on every committed change while interacting — each drag
frame, keystroke, or track press. `onValueChangeEnd` fires once when the
interaction settles (pointer release, or a single keystroke), with the final
value — use it when only the settled value matters, e.g. to persist or refetch.

```tsx
function EventsDemo() {
  const [live, setLive] = React.useState(40);
  const [committed, setCommitted] = React.useState(40);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Brightness</Field.Label>
        {/* onValueChange streams every frame; onValueChangeEnd fires once the
            drag (or keypress) settles — drag the handle to see them diverge. */}
        <Slider
          defaultValue={40}
          min={0}
          max={100}
          onValueChange={setLive}
          onValueChangeEnd={setCommitted}
        />
        <Field.Description>
          Live: {live} · Committed on release: {committed}
        </Field.Description>
      </Field>
    </div>
  );
}

render(<EventsDemo />);
```

## Value tooltip

The value bubble follows the handle on drag or keyboard focus by default
(`tooltip="auto"`). Set `tooltip="always"` to pin it open, or `tooltip="never"`
to hide it entirely — useful when a `Slider.Value` already surfaces the number.
A disabled slider hides the bubble either way.

```tsx
function TooltipDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-12">
      {/* Pinned open — the bubble stays visible without interaction. */}
      <Field>
        <Field.Label>Always visible</Field.Label>
        <Slider defaultValue={40} tooltip="always" formatValue={v => v + '%'} />
      </Field>

      {/* Hidden even on drag/focus — Slider.Value carries the number instead.
          Field.Label and Slider.Value sit inside <Slider> so the readout reads
          the live value from context and can share a row with the label. */}
      <Field>
        <Slider
          tooltip="never"
          defaultValue={70}
          min={0}
          max={100}
          formatValue={v => v + '%'}
        >
          <div className="mb-2 flex items-baseline justify-between">
            <Field.Label>Muted bubble</Field.Label>
            <Slider.Value className="text-sm font-semibold" />
          </div>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </Field>
    </div>
  );
}

render(<TooltipDemo />);
```

## Ticks

The default anatomy is the track alone. To mark the step grid below it, compose
`Slider.Ticks` after `Slider.Track` — an indicator is anatomy, so it is added by
composition rather than switched on by a prop.

```tsx
function TypesDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Slider defaultValue={60} min={0} max={100} step={20}>
        <Slider.Track>
          <Slider.Range />
          <Slider.Thumb />
        </Slider.Track>
        <Slider.Ticks />
      </Slider>
    </div>
  );
}

render(<TypesDemo />);
```

## Track fill

`track` sets how the rail fills. `normal` (default) fills from the start to the
thumb (or between a range's handles); `inverted` fills the complement — from the
thumb to the end for a single slider, and outside the two handles for a range;
`none` drops the fill entirely, leaving just the rail and the thumbs.

```tsx
function TrackDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      {/* inverted (single) — the complement fills: from the thumb to the end. */}
      <Field>
        <Field.Label>Inverted fill</Field.Label>
        <Slider defaultValue={35} track="inverted" formatValue={v => v + '%'} />
      </Field>
      {/* inverted (range) — the fill sits outside the two handles. */}
      <Field>
        <Field.Label>Inverted range</Field.Label>
        <Slider
          range
          defaultValue={[30, 70]}
          track="inverted"
          formatValue={v => v + '%'}
        />
      </Field>
      {/* none — the fill is dropped; the rail and thumb stay. */}
      <Field>
        <Field.Label>No fill</Field.Label>
        <Slider defaultValue={60} track="none" />
      </Field>
    </div>
  );
}

render(<TrackDemo />);
```

## Orientation

Set `orientation="vertical"` to run the rail bottom-to-top: the bottom edge is
`min`, dragging upward increases the value, and the keyboard behaves the same
(Up/Right increase, Down/Left decrease). Every thumb reports the axis through
`aria-orientation`.

A vertical rail has **no intrinsic length** — a horizontal one takes its width
from the parent, but nothing gives a vertical one a height. It fills its
container, so give the slider (or a wrapping element) a height:

```css
.tk-slider[data-orientation='vertical'] {
  height: 240px;
}
```

```tsx
function OrientationDemo() {
  const [level, setLevel] = React.useState(60);

  return (
    <div className="flex items-end gap-10">
      <Field>
        <Field.Label>Altitude</Field.Label>
        <Slider
          orientation="vertical"
          style={{ height: 220 }}
          value={level}
          onValueChange={setLevel}
          formatValue={v => v + '%'}
        />
      </Field>

      <Field>
        <Field.Label>With ticks</Field.Label>
        <Slider
          orientation="vertical"
          style={{ height: 220 }}
          defaultValue={40}
          min={0}
          max={100}
          step={25}
        >
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Ticks />
        </Slider>
      </Field>
    </div>
  );
}

render(<OrientationDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Slider defaultValue={40} size="small" />
      <Slider defaultValue={60} size="base" />
      <Slider defaultValue={80} size="large" />
    </div>
  );
}

render(<SizesDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Slider defaultValue={70} variant="primary" />
      <Slider defaultValue={70} variant="info" />
      <Slider defaultValue={70} variant="success" />
      <Slider defaultValue={70} variant="warning" />
      <Slider defaultValue={70} variant="danger" />
    </div>
  );
}

render(<VariantsDemo />);
```

## States

```tsx
function StatesDemo() {
  const [level, setLevel] = React.useState(75);
  // The invalid treatment is driven by the value: at or above 50 it fails,
  // below 50 the danger fill and the error message both clear.
  const invalid = level >= 50;

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <Slider defaultValue={35} />
      </Field>
      <Field readOnly>
        <Field.Label>Read-only</Field.Label>
        <Slider defaultValue={55} />
      </Field>
      <Field invalid={invalid}>
        <Field.Label>Invalid</Field.Label>
        <Slider value={level} onValueChange={setLevel} />
        {invalid && (
          <Field.ErrorMessage>Pick a value under 50.</Field.ErrorMessage>
        )}
      </Field>
      <Field>
        <Field.Label>Individual thumb disabled</Field.Label>
        {/* Only the lower handle is pinned; the upper one stays interactive. */}
        <Slider range defaultValue={[30, 70]}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} disabled />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider>
      </Field>
    </div>
  );
}

render(<StatesDemo />);
```

## Custom styling

Every part accepts `className`, `classNames`, `style`, and `slotProps`, so the
whole slider is yours to re-skin without leaving the composition — the rail
(`Slider.Track`), the fill (`Slider.Range`), and the handle (`Slider.Thumb`,
whose slots are the `root` handle, the `tooltip` bubble, and the `arrow`
pointer), plus the bubble's content through a `Slider.Thumb` child. The bubble
and its arrow share the `--tk-slider-tooltip-bg` custom property, so one
override recolours both, while the arrow keeps its own `--tk-slider-arrow-width`
/ `-height`. The fill gradient is pinned to the full track width with
`background-size` so it maps to the absolute scale rather than stretching across
the current fill — a low value stays blue instead of squeezing the whole
spectrum into a sliver. The tooltip is revealed on drag or keyboard focus, so
grab the handle to see it.

```tsx
function CustomStyledDemo() {
  const [warmth, setWarmth] = React.useState(60);

  // Zone colour off the absolute value, reused by the fill dot in the bubble.
  const zone = v => (v < 40 ? '#38bdf8' : v < 70 ? '#fbbf24' : '#ef4444');

  return (
    <div className="w-full max-w-md">
      <Field>
        <Field.Label>Warmth</Field.Label>
        <Slider
          value={warmth}
          onValueChange={setWarmth}
          min={0}
          max={100}
          formatValue={v => v + '°'}
        >
          {/* Every part takes style / slotProps, so the whole slider is yours
              to re-skin: a taller rail, a gradient fill, a ringed handle, and
              a custom tooltip (shown on drag or focus). */}
          <Slider.Track
            style={{ height: '12px', background: 'var(--background-dark)' }}
          >
            {/* Pin the gradient to the full track width (448px = the max-w-md
                container) so it maps to the absolute scale instead of stretching
                across the current fill — a low value then stays blue. */}
            <Slider.Range
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #38bdf8, #22c55e, #fbbf24, #ef4444)',
                backgroundSize: '448px 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
              }}
            />
            <Slider.Thumb
              style={{
                '--tk-slider-thumb-size': '26px',
                'background': 'var(--static-light)',
                'border': '2px solid #475569',
              }}
              slotProps={{
                tooltip: {
                  // One override recolours the bubble AND its pointer — they
                  // share the --tk-slider-tooltip-bg custom property.
                  style: {
                    '--tk-slider-tooltip-bg': '#1e3a8a',
                    'borderRadius': 'var(--radius-full)',
                    'fontWeight': 600,
                  },
                },
                arrow: {
                  // The pointer is a real slot now, so resize it like any element.
                  style: {
                    '--tk-slider-arrow-width': '7px',
                    '--tk-slider-arrow-height': '9px',
                  },
                },
              }}
            >
              {({ value, formatted }) => (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      background: zone(value),
                    }}
                  />
                  {formatted}
                </span>
              )}
            </Slider.Thumb>
          </Slider.Track>
        </Slider>
      </Field>
    </div>
  );
}

render(<CustomStyledDemo />);
```

## Keyboard

| Key         | Action                                       |
| ----------- | -------------------------------------------- |
| `←` `↓`     | Decrease the focused thumb by one `step`     |
| `→` `↑`     | Increase the focused thumb by one `step`     |
| `Page Down` | Decrease by ten steps                        |
| `Page Up`   | Increase by ten steps                        |
| `Home`      | Jump to the lowest value the thumb may take  |
| `End`       | Jump to the highest value the thumb may take |

In a range slider each thumb is bounded by its neighbour, so the keyboard can
never push one handle past the other.

## API Reference

### Slider {#slider}

#### Props {#slider-props}

| Name           | Type                                                   | Default        | Description                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `range`        | `boolean`                                              | `false`        | Renders a multi-handle slider: the value becomes an array and one thumb renders per entry (two by default). Dragging one handle past another swaps them, so the committed array stays ascending.                                                                         |
| `value`        | `number \| number[]`                                   | -              | Controlled value — a `number` by default, an array when `range` is set (one thumb per entry; fewer than two entries fall back to `[min, max]`). Each entry is clamped into `[min, max]`, snapped to `step`, and ordered ascending. Takes precedence over `defaultValue`. |
| `defaultValue` | `number \| number[]`                                   | `min`          | Initial value for uncontrolled usage — a `number` by default, an array when `range` is set. Defaults to `min` for a single slider and `[min, max]` for a range. Controlled/uncontrolled mode is latched on the first render.                                             |
| `min`          | `number`                                               | `0`            | Lowest selectable value. Non-finite values fall back to the default.                                                                                                                                                                                                     |
| `max`          | `number`                                               | `100`          | Highest selectable value. Non-finite values and values at or below `min` fall back to `min + 100` (with a dev-only console warning, since an inverted range is a consumer bug).                                                                                          |
| `step`         | `number`                                               | `1`            | Granularity the value snaps to, counted from `min`. Non-finite and non-positive values fall back to the default.                                                                                                                                                         |
| `minDistance`  | `number`                                               | `0`            | Minimum gap kept between adjacent thumbs of a range, in value units. With a positive gap the handles can no longer cross. Ignored by a single slider; initial values are not reshaped, so seed them at least this far apart.                                             |
| `disabled`     | `boolean`                                              | `false`        | Blocks interaction and mutes the fill. Inherits the surrounding `Field`'s disabled state when composed inside one.                                                                                                                                                       |
| `readOnly`     | `boolean`                                              | `false`        | Renders the value but blocks every value-changing interaction. Inherits the surrounding `Field`'s read-only state when composed inside one.                                                                                                                              |
| `required`     | `boolean`                                              | `false`        | Marks the slider as required for form validation. Inherits the surrounding `Field`'s required state when composed inside one.                                                                                                                                            |
| `invalid`      | `boolean`                                              | `false`        | Applies the invalid treatment and sets `aria-invalid` on every thumb. Inherits the surrounding `Field`'s invalid state when composed inside one.                                                                                                                         |
| `orientation`  | `SliderOrientation`                                    | `'horizontal'` | Axis the rail runs along. A vertical rail runs bottom-to-top and fills its container's height (as a horizontal rail fills its width), so give the parent a height.                                                                                                       |
| `size`         | `SliderSize`                                           | `'base'`       | Visual scale — changes track thickness and thumb diameter.                                                                                                                                                                                                               |
| `variant`      | `SliderVariant`                                        | `'primary'`    | Fill color variant.                                                                                                                                                                                                                                                      |
| `track`        | `SliderTrackMode`                                      | `'normal'`     | How the rail fill renders. `normal` fills from the start to the thumb (or between a range's thumbs); `inverted` fills the _complement_ instead; `none` drops the fill entirely, leaving just the rail and the thumbs.                                                    |
| `tooltip`      | `SliderTooltip`                                        | `'auto'`       | When the drag value bubble is shown. `auto` reveals it while dragged or keyboard-focused; `always` pins it open; `never` hides it entirely — handy when a `Slider.Value` already surfaces the number. A disabled slider hides the bubble regardless.                     |
| `formatValue`  | `(value: number) => string`                            | -              | Formats a value for every readout — the drag tooltip, `Slider.Value`, and `aria-valuetext`. Returns a string; use `Slider.Thumb` / `Slider.Value` children for richer content. When omitted, the raw number is shown and `aria-valuetext` is dropped.                    |
| `name`         | `string`                                               | -              | Name submitted with the form. A single slider submits one entry under this exact name; a two-handle range submits `-min` / `-max`, and a range with more handles submits each value under a 1-based `-1`, `-2`, … suffix so no handle is dropped.                        |
| `form`         | `string`                                               | -              | `id` of the form the hidden inputs belong to.                                                                                                                                                                                                                            |
| `children`     | `React.ReactNode`                                      | -              | Optional anatomy override. When omitted, `Slider` renders `Slider.Track` wrapping `Slider.Range` and one thumb per value.                                                                                                                                                |
| `classNames`   | `Partial<Record<"root", string>>`                      | -              | Per-slot class name overrides.                                                                                                                                                                                                                                           |
| `slotProps`    | `Partial<Record<"root", HTMLAttributes<HTMLElement>>>` | -              | Per-slot HTML attribute overrides.                                                                                                                                                                                                                                       |
| `className`    | `string`                                               | -              | Appends custom classes to the root slot.                                                                                                                                                                                                                                 |

#### Events {#slider-events}

| Name               | Type                                  | Default | Description                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onValueChange`    | `(value: number \| number[]) => void` | -       | Fired on every committed value change while interacting — each drag frame, keystroke, or track press. Receives a `number` by default and the full ascending array when `range` is set.                                                    |
| `onValueChangeEnd` | `(value: number \| number[]) => void` | -       | Fired once at the end of an interaction with the final value: on pointer release after a drag or track press, and once per committed keystroke. Use it when only the settled value matters, while `onValueChange` streams the live value. |

#### Data attributes {#slider-data-attributes}

| Attribute          | Applied when                                                      | Purpose                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-slot="root"` | Always                                                            | Stable selector for wrapper styling on the root slot.                                                                                                                                           |
| `data-size`        | Always                                                            | Reflects the resolved `size` prop for theme recipe scoping (rail thickness and thumb diameter).                                                                                                 |
| `data-variant`     | Always                                                            | Reflects the resolved `variant` prop that drives the fill color.                                                                                                                                |
| `data-orientation` | Always                                                            | Reflects the resolved `orientation` prop. A vertical rail runs bottom-to-top and takes its height from its container, as a horizontal rail takes its width.                                     |
| `data-tooltip`     | Always                                                            | Reflects the resolved `tooltip` prop (`auto` \| `always` \| `never`) that controls when the value bubble shows.                                                                                 |
| `data-track`       | Always                                                            | Reflects the resolved `track` prop (`normal` \| `inverted` \| `none`) that sets the rail fill mode; `inverted` fills the complement of the selection, `none` drops the fill but keeps the rail. |
| `data-range`       | When `range` is set                                               | Marks a multi-thumb slider (two or more handles) so the recipe can style the fill as a band between the outermost handles.                                                                      |
| `data-disabled`    | When disabled (own prop or inherited from a surrounding `Field`)  | Mutes the fill and blocks every interaction.                                                                                                                                                    |
| `data-readonly`    | When read-only (own prop or inherited from a surrounding `Field`) | Renders the value while blocking value-changing interaction.                                                                                                                                    |
| `data-invalid`     | When invalid (own prop or inherited from a surrounding `Field`)   | Applies the invalid treatment; each thumb also exposes `aria-invalid`.                                                                                                                          |
| `data-required`    | When required (own prop or inherited from a surrounding `Field`)  | Marks the control as required; each thumb also exposes `aria-required`.                                                                                                                         |
| `data-thumb`       | On each thumb of a range slider                                   | `min` on the first handle and `max` on the last. A handle between them is neither end, so it carries no `data-thumb` rather than a misleading one.                                              |
| `data-dragging`    | On the thumb the pointer currently controls                       | Reveals the value tooltip and suppresses the position transition so the handle tracks the pointer exactly.                                                                                      |
| `data-focus`       | On the focused thumb                                              | Draws the focus ring and reveals the value tooltip for keyboard users.                                                                                                                          |
| `role="slider"`    | On every thumb                                                    | The thumb is the accessibility owner: it carries `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and the keyboard surface.                                                                  |
| `role="group"`     | When `range` is set                                               | Ties the two `role="slider"` thumbs together under the surrounding `Field` label.                                                                                                               |

### Compound parts

`Slider.Track`, `Slider.Range`, `Slider.Thumb`, `Slider.Ticks`, and
`Slider.Value` expose only the shared customization plumbing — `children` (where
allowed), `className`, `classNames`, `slotProps`, and native HTML attributes —
so they have no bespoke props table. Their slots and per-part behavior:

| Part           | Slots                      | Notes                                                                                                                                                                                                                                                      |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Slider.Track` | `root`                     | The rail the thumbs travel along. Owns press-to-seek: pressing the rail moves the nearest thumb there and starts dragging it. Defaults to `Slider.Range` + one thumb per value.                                                                            |
| `Slider.Range` | `root`                     | The filled portion of the track. Takes no children; its offset and length are written inline from the committed values.                                                                                                                                    |
| `Slider.Thumb` | `root`, `tooltip`, `arrow` | The draggable handle and `role="slider"` a11y owner. `index` selects the value it controls; `disabled` pins just this handle. `children` (node or render fn) replace only the value-bubble content.                                                        |
| `Slider.Ticks` | `root`, `tick`             | Decorative (`aria-hidden`) marks at every `step`. Opt-in: compose after `Slider.Track`.                                                                                                                                                                    |
| `Slider.Value` | `root`                     | Decorative (`aria-hidden`) value readout. `children` as a function receive the committed values — the only way to read an **uncontrolled** slider's value without lifting state out. Defaults to the formatted value (range entries joined by an en dash). |

### Type Definitions {#slider-type-definitions}

| Name                     | Definition                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `SliderValue`            | `number \| number[]`                                                                           |
| `SliderOrientation`      | `'horizontal' \| 'vertical'`                                                                   |
| `SliderSize`             | `'small' \| 'base' \| 'large'`                                                                 |
| `SliderVariant`          | `'primary' \| 'info' \| 'success' \| 'danger' \| 'warning'`                                    |
| `SliderTrackMode`        | `'normal' \| 'inverted' \| 'none'`                                                             |
| `SliderTooltip`          | `'auto' \| 'always' \| 'never'`                                                                |
| `SliderSlot`             | `'root'`                                                                                       |
| `SliderThumbRenderProps` | `{ value: number; formatted: string; index: number; isDragging: boolean; isFocused: boolean }` |
| `SliderValueRenderProps` | `{ values: number[]; formatted: string[]; range: boolean }`                                    |

## Source

- Docs: `apps/docs/docs/components/slider.mdx`
- Component: `packages/react-spar/src/components/slider/`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/slider
