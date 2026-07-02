# Switch

`Switch` lets users turn a single setting on or off, especially for preferences,
permissions, and form options. The root owns visual state (`size`, `variant`,
plus inherited `invalid` / `disabled` / `required` / `optional` / `readOnly`),
`Switch.Indicator` is the track + sliding thumb. Wrap `Switch` in a `Field` to
attach a label, description, or error message — the field-level state cascades
into the switch automatically.

## Usage

```tsx
import { Field, Switch } from '@takeoff-ui/react-spar';
```

```tsx
<Field>
  <Field.Label />
  <Switch>
    <Switch.Indicator />
  </Switch>
  <Field.Description />
  <Field.ErrorMessage />
</Field>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
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
  );
}

render(<PlaygroundDemo />);
```

## Using with `Field`

`Field` is the generic ARIA wrapper. Setting `invalid`, `disabled`, `required`,
`optional`, or `readOnly` on `Field` cascades into the nested `Switch`, and
`Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
switch through shared IDs.

```tsx
function FieldWithSwitchDemo() {
  return (
    <div className="grid w-full max-w-90 gap-6">
      <Field required>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Email alerts</Field.Label>
          <Switch defaultChecked>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>

      <Field>
        <div className="flex w-full items-center justify-between">
          <div>
            <Field.Label>SMS alerts</Field.Label>
            <Field.Description>
              Standard messaging rates may apply.
            </Field.Description>
          </div>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>

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

      <Field disabled>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Disabled setting</Field.Label>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>

      <Field readOnly>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Read-only setting</Field.Label>
          <Switch defaultChecked>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
    </div>
  );
}

render(<FieldWithSwitchDemo />);
```

## Controlled

```tsx
function ControlledSwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="grid w-full max-w-90 gap-3">
      <Badge className="w-fit" variant="neutral" appearance="outlined">
        Notifications {enabled ? 'enabled' : 'paused'}
      </Badge>
      <Field>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Flight status notifications</Field.Label>
          <Switch checked={enabled} onChange={setEnabled}>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
    </div>
  );
}

render(<ControlledSwitchDemo />);
```

## Sizes

```tsx
function SizeDemo() {
  return (
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
  );
}

render(<SizeDemo />);
```

## Variants

```tsx
function VariantDemo() {
  return (
    <div className="grid w-full max-w-90 gap-3">
      <Field>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Seat alerts</Field.Label>
          <Switch defaultChecked variant="info">
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
      <Field>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Auto check-in</Field.Label>
          <Switch defaultChecked variant="success">
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
    </div>
  );
}

render(<VariantDemo />);
```

## Custom Indicator

`Switch.Indicator` accepts function children that receive the current `checked`
/ `disabled` / `readOnly` state, so you can render different content per state.
Passing a `ReactNode` instead replaces the default `thumb` slot entirely — the
consumer becomes responsible for any `data-slot="thumb"` wrapper they need for
theming.

```tsx
function CustomIndicatorDemo() {
  const SliderThumb = ({ active }) => (
    <span
      aria-hidden="true"
      className="inline-flex h-full w-full items-center justify-center whitespace-nowrap transition-transform duration-200"
    >
      {active ? (
        <CheckIconOutlinedRounded width={20} height={20} />
      ) : (
        <BlockIconOutlinedRounded width={20} height={20} />
      )}
    </span>
  );

  return (
    <Field className="max-w-90">
      <div className="flex w-full items-center justify-between">
        <Field.Label>Auto check-in</Field.Label>
        <Switch defaultChecked variant="success">
          <Switch.Indicator>
            {({ checked }) => (
              <span
                data-slot="thumb"
                className="tk-toggle-thumb inline-flex items-center justify-center"
              >
                <SliderThumb active={checked} />
              </span>
            )}
          </Switch.Indicator>
        </Switch>
      </div>
    </Field>
  );
}

render(<CustomIndicatorDemo />);
```

## Render Prop

```tsx
function RenderPropDemo() {
  return (
    <div>
      <Field>
        <Switch defaultChecked>
          {({ checked }) => (
            <>
              <Field.Label>
                {checked
                  ? 'Operational alerts active'
                  : 'Operational alerts paused'}
              </Field.Label>
              <Switch.Indicator />
            </>
          )}
        </Switch>
      </Field>
    </div>
  );
}

render(<RenderPropDemo />);
```

## Form Submission

When `name` is set, Spar renders a synchronized hidden checkbox input for native
form submission.

```tsx
function SwitchFormDemo() {
  const [saved, setSaved] = useState('Not submitted');

  return (
    <form
      className="grid w-full max-w-90 gap-3"
      onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(
          [
            data.get('email') ? 'Email alerts' : null,
            data.get('sms') ? 'SMS alerts' : null,
          ]
            .filter(Boolean)
            .join(', ') || 'No alerts',
        );
      }}
    >
      <Field>
        <div className="flex w-full items-center justify-between">
          <Field.Label>Email alerts</Field.Label>
          <Switch name="email" value="enabled" defaultChecked>
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
      <Field>
        <div className="flex w-full items-center justify-between">
          <Field.Label>SMS alerts</Field.Label>
          <Switch name="sms" value="enabled">
            <Switch.Indicator />
          </Switch>
        </div>
      </Field>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="submit">Save</Button>
        <Badge className="w-fit" variant="neutral" appearance="outlined">
          {saved}
        </Badge>
      </div>
    </form>
  );
}

render(<SwitchFormDemo />);
```

## Accessibility

- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
  control via stable IDs derived from the `Field` root (`aria-labelledby`,
  `aria-describedby`, `aria-invalid`).
- `Switch` renders a focusable control with `role="switch"` and reflects its
  value through `aria-checked`.
- When the switch has no visible label (for example a size sampler), pass
  `aria-label` directly on `<Switch>`.
- Disabled switches are removed from the tab order. Read-only switches remain
  focusable and do not change value.
- When `name` is provided, Spar renders a synchronized hidden checkbox input for
  native form submission. `name` is the form field name, not the accessible
  label.

| Key           | Behavior                            |
| ------------- | ----------------------------------- |
| Enter / Space | Toggle the focused switch.          |
| Tab           | Move focus to the next tabbable UI. |

## API Reference

### Switch {#switch}

See
[Spar Switch docs](https://spar.app.turkishtechlab.com/docs/Components/Switch)
for primitive behavior.

#### Props {#switch-props}

| Name       | Type                                                                 | Default | Description                                                                                                    |
| ---------- | -------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode \| ((state: SwitchRenderProps) => React.ReactNode)` | -       | Compound children for switch anatomy, or a render function exposing Spar state.                                |
| size       | `SwitchSize`                                                         | 'base'  | Size scale.                                                                                                    |
| variant    | `SwitchVariant`                                                      | 'info'  | Color variant used while checked.                                                                              |
| invalid    | `boolean`                                                            | false   | Marks the switch as visually invalid. Inherited from `<Field>` automatically; pass this prop only to override. |
| classNames | `Partial<Record<SwitchSlot, string>>`                                | -       | Per-slot class name overrides.                                                                                 |
| slotProps  | `Partial<Record<SwitchSlot, React.HTMLAttributes<HTMLElement>>>`     | -       | Per-slot HTML attribute overrides.                                                                             |
| className  | `string`                                                             | -       | Appends custom classes to the root slot of this part.                                                          |

#### Data attributes {#switch-data-attributes}

| Attribute              | Applied when        | Purpose                                                                         |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------- |
| data-slot="root"       | Always              | Stable selector for the root slot.                                              |
| data-size              | Always              | Reflects the resolved `size` prop so theme recipes can scope size variants.     |
| data-variant           | Always              | Reflects the resolved `variant` prop so theme recipes can scope color variants. |
| data-state="checked"   | When checked.       | Spar checked-state hook.                                                        |
| data-state="unchecked" | When unchecked.     | Spar unchecked-state hook.                                                      |
| data-disabled          | `disabled` is true. | Spar disabled-state hook.                                                       |
| data-readonly          | `readOnly` is true. | Spar read-only-state hook.                                                      |
| data-required          | `required` is true. | Spar required-state hook.                                                       |
| data-invalid           | `invalid` is true.  | Marks invalid visual state for theme recipes.                                   |

### Switch.Indicator {#switch-indicator}

See
[Spar Switch docs](https://spar.app.turkishtechlab.com/docs/Components/Switch)
for primitive behavior.

#### Data attributes {#switch-indicator-data-attributes}

| Attribute             | Applied when | Purpose                                 |
| --------------------- | ------------ | --------------------------------------- |
| data-slot="indicator" | Always       | Stable selector for the indicator slot. |
| data-slot="thumb"     | Always       | Stable selector for the thumb slot.     |

### Type Definitions {#switch-type-definitions}

| Name                       | Definition                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SwitchRenderProps          | `{ checked: boolean; setChecked: (checked: boolean) => void; disabled: boolean; readOnly: boolean; required: boolean; invalid: boolean; isFocused: boolean; isHovered: boolean; isPressed: boolean }` |
| SwitchSize                 | `'xlarge' \| 'large' \| 'base' \| 'small' \| 'xsmall'`                                                                                                                                                |
| SwitchVariant              | `'info' \| 'success'`                                                                                                                                                                                 |
| SwitchSlot                 | `'root' \| 'indicator' \| 'thumb'`                                                                                                                                                                    |
| SwitchIndicatorRenderProps | `{ checked: boolean; disabled: boolean; readOnly: boolean }`                                                                                                                                          |
