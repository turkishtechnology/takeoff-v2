# Progress

`Progress` shows how far a task has advanced as a horizontal bar (`'linear'`) or
a ring (`'circular'`). The anatomy is the same for both appearances: the root is
the wrapper and accessibility owner, `Progress.Track` is the rail (the linear
rail bar, or the ring svg drawing the rail circle), `Progress.Indicator` is the
filled portion, and `Progress.Value` composes decorative value or status text —
in flow next to the linear track, centered inside the circular ring.

Set `indeterminate` while the work's extent is unknown — the indicator loops a
sweep animation instead of a fill. For standalone loading states with no
progress semantics, a [`Spinner`](/docs/components/spinner) is still the right
component.

The root carries `role="progressbar"` with the full `aria-valuemin` /
`aria-valuemax` / `aria-valuenow` surface, so assistive technology announces the
value without extra wiring. Compose it inside a
[`Field`](/docs/components/input#using-with-field) with `Field.Label` for a
visible label — the accessible name and the field's disabled state wire up
automatically.

## Usage

```tsx
import { Field, Progress } from '@takeoff-ui/react-spar';
```

```tsx
<Progress value={33} />

<Field>
  <Field.Label>Upload progress</Field.Label>
  <Progress size="large" value={66} />
</Field>

<Progress value={40}>
  <Progress.Track />
  <Progress.Value>%40</Progress.Value>
</Progress>

<Progress appearance="circular" value={66} aria-label="Upload progress">
  <Progress.Track />
  <Progress.Value>%66</Progress.Value>
</Progress>
```

## Playground

```tsx
function PlaygroundDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setValue(prev => (prev >= 100 ? 0 : Math.min(prev + 4, 100)));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-8">
      <Field className="w-full">
        <Field.Label>Uploading files</Field.Label>
        <Progress value={value}>
          <Progress.Track />
          <Progress.Value>%{value}</Progress.Value>
        </Progress>
      </Field>
      <Progress
        appearance="circular"
        value={value}
        aria-label={'Uploading ' + value + '%'}
      >
        <Progress.Track />
        <Progress.Value>%{value}</Progress.Value>
      </Progress>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Variants

`variant` recolors the filled portion of the track.

```tsx
function VariantsDemo() {
  const variants = ['primary', 'info', 'success', 'danger', 'warning'];

  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-5">
      {variants.map(variant => (
        <Field key={variant}>
          <Field.Label>{variant}</Field.Label>
          <Progress variant={variant} value={60}>
            <Progress.Track />
            <Progress.Value>%60</Progress.Value>
          </Progress>
        </Field>
      ))}
    </div>
  );
}

render(<VariantsDemo />);
```

## Circular

`appearance="circular"` renders `Progress.Track` as the ring svg — it draws the
rail circle and hosts the arc indicator. `Progress.Value` composes value or
status text centered inside the ring — it is decorative (`aria-hidden`), so keep
the accessible name on the root via `aria-label` or a `Field.Label`.

```tsx
function CircularDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {[25, 50, 75].map(value => (
        <Progress
          key={value}
          appearance="circular"
          size="large"
          value={value}
          aria-label={'Progress ' + value + '%'}
        >
          <Progress.Track />
          <Progress.Value>%{value}</Progress.Value>
        </Progress>
      ))}
    </div>
  );
}

render(<CircularDemo />);
```

## Sizes

`size` scales the linear track height and the composed linear `Progress.Value`
typography, plus the circular ring diameter. Circular sizes are `64px`, `96px`,
and `128px` for `small`, `base`, and `large` — the centered `Progress.Value`
typography scales with the ring automatically.

```tsx
function SizesDemo() {
  const sizes = ['small', 'base', 'large'];

  return (
    <div className="mx-auto grid w-full max-w-120 gap-8">
      <div className="grid gap-4">
        {sizes.map(size => (
          <Field key={size}>
            <Field.Label>{size}</Field.Label>
            <Progress size={size} value={60}>
              <Progress.Track />
              <Progress.Value>%60</Progress.Value>
            </Progress>
          </Field>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {sizes.map(size => (
          <Progress
            key={size}
            appearance="circular"
            size={size}
            value={60}
            aria-label={size + ' progress'}
          >
            <Progress.Track />
            <Progress.Value>%60</Progress.Value>
          </Progress>
        ))}
      </div>
    </div>
  );
}

render(<SizesDemo />);
```

## Indeterminate

Set `indeterminate` when the work's extent is unknown — the indicator loops a
sweep animation, the root drops `aria-valuenow`, and `data-indeterminate` is
emitted for styling hooks. It takes precedence over `value`.

```tsx
function IndeterminateDemo() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-8">
      <Field className="w-full">
        <Field.Label>Preparing upload</Field.Label>
        <Progress indeterminate />
      </Field>
      <Progress appearance="circular" indeterminate aria-label="Loading" />
    </div>
  );
}

render(<IndeterminateDemo />);
```

## Disabled

`disabled` mutes the fill and sets `aria-disabled`. Inside a disabled `Field`
the state is inherited, so the label and the filled portion gray out together.

```tsx
function DisabledDemo() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-8">
      <Field disabled className="w-full">
        <Field.Label>Paused upload</Field.Label>
        <Progress value={40}>
          <Progress.Track />
          <Progress.Value>%40</Progress.Value>
        </Progress>
      </Field>
      <Progress
        appearance="circular"
        value={40}
        disabled
        aria-label="Paused upload"
      >
        <Progress.Track />
        <Progress.Value>%40</Progress.Value>
      </Progress>
    </div>
  );
}

render(<DisabledDemo />);
```

## Block / Inline

Linear progress can be composed as a block pattern with the percentage below the
bar, or as an inline pattern with the percentage beside the bar. The linear root
stacks `Progress.Track` and `Progress.Value` with the design's sign gap; for the
inline pattern flip the root to a row layout with an inline `style` (the
recipe's layout styles take precedence over utility classes).

```tsx
function LayoutsDemo() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-8">
      <Field>
        <Field.Label>Block progress</Field.Label>
        <Progress value={40}>
          <Progress.Track />
          <Progress.Value>%40</Progress.Value>
        </Progress>
      </Field>

      <Field>
        <Field.Label>Inline progress</Field.Label>
        <Progress
          value={40}
          style={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}
        >
          <Progress.Track />
          <Progress.Value className="shrink-0">%40</Progress.Value>
        </Progress>
      </Field>
    </div>
  );
}

render(<LayoutsDemo />);
```

## Sections

`Progress.Track` accepts custom children, so a stacked breakdown composes as
plain segments inside the rail — the track's radius and `overflow: hidden` clip
them into the bar shape. Give the track a taller inline height to fit
per-segment value text (the design rail is 4–8px). Keep the aggregate on the
root's `value` and pass `aria-valuetext` so assistive technology announces the
total meaningfully; the in-segment texts stay `aria-hidden`.

```tsx
function SectionsDemo() {
  const sections = [
    { label: 'Documents', value: 35, color: 'var(--states-info-base)' },
    { label: 'Media', value: 25, color: 'var(--states-success-base)' },
    { label: 'Other', value: 15, color: 'var(--states-warning-base)' },
  ];
  const used = sections.reduce((total, section) => total + section.value, 0);

  return (
    <div className="mx-auto w-full max-w-120">
      <Field>
        <Field.Label>Storage</Field.Label>
        <Progress value={used} aria-valuetext={used + '% of storage used'}>
          <Progress.Track style={{ height: '20px', display: 'flex' }}>
            {sections.map(section => (
              <span
                key={section.label}
                aria-hidden="true"
                className="inline-flex items-center justify-center text-xs font-medium text-[color:var(--text-lightest)]"
                style={{
                  width: section.value + '%',
                  backgroundColor: section.color,
                }}
              >
                %{section.value}
              </span>
            ))}
          </Progress.Track>
          <Progress.Value>%{used} used</Progress.Value>
        </Progress>
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-[color:var(--text-base)]">
          {sections.map(section => (
            <span
              key={section.label}
              className="inline-flex items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: section.color }}
              />
              {section.label}
            </span>
          ))}
        </div>
      </Field>
    </div>
  );
}

render(<SectionsDemo />);
```

## Accessibility

- The root exposes `role="progressbar"` with `aria-valuemin`, `aria-valuemax`,
  and the clamped `aria-valuenow`. When indeterminate, `aria-valuenow` is
  omitted so assistive technology announces a busy progressbar instead of a
  bogus percentage.
- Composing inside a `Field` with `Field.Label` wires `aria-labelledby` to the
  label automatically. Outside a `Field`, pass `aria-label` or
  `aria-labelledby`; without either, the root falls back to a default
  `aria-label`.
- Pass `aria-valuetext` when the raw number reads poorly — e.g.
  `aria-valuetext="3 of 10 steps"` — and assistive technology announces the
  formatted text instead of the percentage.
- The rendered track, indicator, and `Progress.Value` are decorative and hidden
  from assistive technology — the value is announced through `aria-valuenow`.
- Motion respects `prefers-reduced-motion`: the determinate fill transition is
  dropped entirely, and the indeterminate sweep slows down (it still conveys
  "working", the same policy as `Spinner`).

## API Reference

### Progress {#progress}

#### Props {#progress-props}

| Name          | Type                                                   | Default   | Description                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| children      | `React.ReactNode`                                      | -         | Optional anatomy override. When omitted, the root renders the default anatomy — `Progress.Track` wrapping `Progress.Indicator` — for both appearances.                                                 |
| value         | `number`                                               | 0         | Current progress value. Clamped to `[min, max]`; non-finite values resolve to `min`. Ignored while `indeterminate` is set.                                                                             |
| indeterminate | `boolean`                                              | false     | Marks the progress as indeterminate — the root drops `aria-valuenow`, emits `data-indeterminate`, and the indicator animates a looping sweep instead of a fill. Takes precedence over `value`.         |
| min           | `number`                                               | 0         | Minimum value the progress starts from. Non-finite values fall back to the default.                                                                                                                    |
| max           | `number`                                               | 100       | Maximum value the progress can reach. Non-finite values and values at or below `min` fall back to `min + 100` (the latter with a dev-only console warning, since an inverted range is a consumer bug). |
| appearance    | `ProgressAppearance`                                   | 'linear'  | Shape of the progress indicator — a horizontal bar (`'linear'`) or a ring (`'circular'`).                                                                                                              |
| size          | `ProgressSize`                                         | 'base'    | Visual scale. Linear progress changes track height; circular progress changes ring diameter.                                                                                                           |
| variant       | `ProgressVariant`                                      | 'primary' | Fill color variant.                                                                                                                                                                                    |
| disabled      | `boolean`                                              | false     | Mutes the fill color and sets `aria-disabled`. Inherits the surrounding `Field`'s disabled state when composed inside one.                                                                             |
| classNames    | `Partial<Record<"root", string>>`                      | -         | Per-slot class name overrides.                                                                                                                                                                         |
| slotProps     | `Partial<Record<"root", HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML attribute overrides.                                                                                                                                                                     |
| className     | `string`                                               | -         | Appends custom classes to the root slot of this part.                                                                                                                                                  |

#### Data attributes {#progress-data-attributes}

| Attribute          | Applied when                                                | Purpose                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root"   | Always                                                      | Stable selector for wrapper styling on the root slot.                                                                                                                                                                       |
| data-type          | Always                                                      | Reflects the resolved `appearance` prop (`linear` \| `circular`).                                                                                                                                                           |
| data-size          | Always                                                      | Reflects the resolved `size` prop so recipes can scale the bar or ring.                                                                                                                                                     |
| data-variant       | Always                                                      | Reflects the resolved `variant` prop so theme recipes can recolor the fill.                                                                                                                                                 |
| data-disabled      | disabled (own prop or inherited from a surrounding `Field`) | Mutes the fill color through the recipe.                                                                                                                                                                                    |
| data-indeterminate | `indeterminate`                                             | Marks the indeterminate state; `aria-valuenow` is dropped alongside it.                                                                                                                                                     |
| data-complete      | Determinate and the clamped `value` reaches `max`           | Styling hook for finished states (e.g. a success fill at 100%). It flips the instant the value reaches `max` — the fill’s 0.3s transition may still be catching up visually, so completion styling leads the fill slightly. |

### Progress.Track {#progress-track}

#### Data attributes {#progress-track-data-attributes}

| Attribute        | Applied when          | Purpose                                                                                                |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| data-slot="root" | Always                | Stable selector for wrapper styling on the root slot.                                                  |
| data-slot="rail" | appearance="circular" | The rail `<circle>` the ring svg draws; style or override it via `classNames.rail` / `slotProps.rail`. |
| data-type        | Always                | Reflects the root’s resolved `appearance` so the part’s recipe styles itself without root selectors.   |

### Progress.Indicator {#progress-indicator}

#### Data attributes {#progress-indicator-data-attributes}

| Attribute          | Applied when    | Purpose                                                                                              |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------- |
| data-slot="root"   | Always          | Stable selector for wrapper styling on the root slot.                                                |
| data-type          | Always          | Reflects the root’s resolved `appearance` so the part’s recipe styles itself without root selectors. |
| data-indeterminate | `indeterminate` | Drives the looping sweep animation instead of a written fill.                                        |

### Progress.Value {#progress-value}

#### Data attributes {#progress-value-data-attributes}

| Attribute        | Applied when | Purpose                                                                                              |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                |
| data-type        | Always       | Reflects the root’s resolved `appearance` so the part’s recipe styles itself without root selectors. |

### Type Definitions {#progress-type-definitions}

| Name               | Definition                                                  |
| ------------------ | ----------------------------------------------------------- |
| ProgressAppearance | `'linear' \| 'circular'`                                    |
| ProgressSize       | `'small' \| 'base' \| 'large'`                              |
| ProgressVariant    | `'primary' \| 'info' \| 'success' \| 'danger' \| 'warning'` |
| ProgressTrackSlot  | `'root' \| 'rail'`                                          |
