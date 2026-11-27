# ColorPicker

`ColorPicker` is Core `tk-color-picker` for React: a typable field that opens a
panel with a saturation/brightness area, hue and alpha sliders, typed channel
fields, an eyedropper and preset swatches. Spar has no slider or 2D area
primitive, so the wrapper owns the value model and the area; the disclosure is
`Popover`, the sliders are `Slider`, and the fields are `Input` and `Select`, so
their keyboard, sizing and accessibility apply unchanged.

## Usage

```tsx
import { ColorPicker } from '@takeoff-ui/react-spar';
```

```tsx
<ColorPicker defaultValue="#326fd1" />
```

Compose it inside a `Field` to wire the label, the description and the shared
`disabled` / `readOnly` / `invalid` / `required` state. The Field names the
trigger field and the panel; the controls inside the panel keep their own names
(Hue, Opacity, Hex…).

## Playground

```tsx
function PlaygroundDemo() {
  const [color, setColor] = React.useState('#326fd1');

  return (
    <div className="mx-auto w-72">
      <Field>
        <Field.Label>Brand color</Field.Label>
        <ColorPicker
          value={color}
          onValueChange={setColor}
          placeholder="#rrggbb"
        />
        <Field.Description>
          Type any HEX, RGB or HSL value, or open the panel.
        </Field.Description>
      </Field>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Value and formats

`value` is a CSS color string in the active `format` — `#rrggbb` (`#rrggbbaa`
below full opacity), `rgb(r, g, b)` / `rgba(r, g, b, a)` or `hsl(h, s%, l%)` /
`hsla(h, s%, l%, a)` — and `''` means no color. The field parses any of the
three notations whatever the format (`#rgb`, `#rgba`, the `#` optional, and the
comma or space `rgb()` / `hsl()` forms); text that is not a color is rejected
and the value stays. The format select, or a controlled `format`, re-serializes
the same color.

`onValueChange` streams every change, including each drag frame;
`onValueChangeEnd` fires once per settled change — pointer release, a key press,
a committed field, a swatch, the eyedropper, or Escape restoring the opened
value.

```tsx
function FormatDemo() {
  const [format, setFormat] = React.useState('hsl');
  const [color, setColor] = React.useState('hsl(217, 63%, 51%)');

  return (
    <div className="mx-auto flex w-72 flex-col gap-3">
      <Field>
        <Field.Label>Accent</Field.Label>
        <ColorPicker
          value={color}
          onValueChange={setColor}
          format={format}
          onFormatChange={setFormat}
        />
      </Field>
      <div className="flex gap-2">
        {['hex', 'rgb', 'hsl'].map(next => (
          <Button
            key={next}
            size="small"
            variant="neutral"
            appearance={next === format ? 'filled' : 'outlined'}
            onClick={() => setFormat(next)}
          >
            {next.toUpperCase()}
          </Button>
        ))}
      </div>
      <code>{color}</code>
    </div>
  );
}

render(<FormatDemo />);
```

## Inline

Render a `ColorPicker.Panel` without the field and popover for an always-visible
picker.

```tsx
function InlineDemo() {
  const [color, setColor] = React.useState('rgba(17, 156, 141, 0.8)');

  return (
    <div className="flex flex-col items-center gap-3">
      <ColorPicker value={color} onValueChange={setColor} defaultFormat="rgb">
        <ColorPicker.Panel />
      </ColorPicker>
      <code>{color}</code>
    </div>
  );
}

render(<InlineDemo />);
```

## Orientation

`orientation="horizontal"` is Core’s second layout: preview, upright sliders and
eyedropper beside the area.

```tsx
function OrientationDemo() {
  return (
    <div className="flex justify-center">
      <ColorPicker defaultValue="#c79807" orientation="horizontal">
        <ColorPicker.Panel />
      </ColorPicker>
    </div>
  );
}

render(<OrientationDemo />);
```

## Alpha and swatches

`alpha={false}` hides the alpha slider and field and keeps every value opaque.
`swatches` replaces Core’s preset row; `[]` removes it.

```tsx
function SwatchesDemo() {
  return (
    <div className="mx-auto w-72">
      <Field>
        <Field.Label>Status color</Field.Label>
        <ColorPicker
          defaultValue="#119c8d"
          alpha={false}
          swatches={['#119c8d', '#c79807', '#ff6259', '#326fd1', '#717784']}
        />
      </Field>
    </div>
  );
}

render(<SwatchesDemo />);
```

## Composition

Every part of the default panel is public, so a panel can drop or reorder
controls. `ColorPicker.Swatches` with children shows your own swatches instead
of the root list.

```tsx
function CompositionDemo() {
  return (
    <div className="flex justify-center">
      <ColorPicker defaultValue="#a45e3c">
        <ColorPicker.Panel>
          <ColorPicker.Area />
          <ColorPicker.HueSlider />
          <ColorPicker.ChannelFields />
          <ColorPicker.Swatches>
            <ColorPicker.Swatch value="#a45e3c" />
            <ColorPicker.Swatch value="#edbba3" />
            <ColorPicker.Swatch value="#ead6fd" />
          </ColorPicker.Swatches>
        </ColorPicker.Panel>
      </ColorPicker>
    </div>
  );
}

render(<CompositionDemo />);
```

## States

A disabled or read-only picker never opens its panel.

```tsx
function StatesDemo() {
  return (
    <div className="mx-auto flex w-72 flex-col gap-4">
      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <ColorPicker defaultValue="#326fd1" />
      </Field>
      <Field readOnly>
        <Field.Label>Read-only</Field.Label>
        <ColorPicker defaultValue="#326fd1" />
      </Field>
      <Field invalid required>
        <Field.Label>Required</Field.Label>
        <ColorPicker size="small" placeholder="Pick a color" />
        <Field.ErrorMessage>Choose a color.</Field.ErrorMessage>
      </Field>
    </div>
  );
}

render(<StatesDemo />);
```

## Forms

With `name`, a hidden input submits the committed value. Typed text that was
never committed is not submitted, and a disabled picker submits nothing.

```tsx
function FormDemo() {
  const [submitted, setSubmitted] = React.useState('');

  return (
    <form
      className="mx-auto flex w-72 flex-col gap-3"
      onSubmit={event => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('theme')));
      }}
    >
      <Field>
        <Field.Label>Theme color</Field.Label>
        <ColorPicker name="theme" defaultValue="#ff6259" />
      </Field>
      <Button type="submit">Submit</Button>
      {submitted && <code>theme={submitted}</code>}
    </form>
  );
}

render(<FormDemo />);
```

## Keyboard

| Element        | Key                  | Action                                            |
| -------------- | -------------------- | ------------------------------------------------- |
| Field          | Enter, blur          | Parse and commit the typed text                   |
| Field          | Escape               | Restore the typed text to the value               |
| Field          | ↓                    | Open the panel                                    |
| Area           | ← →                  | Saturation −1 / +1 (Shift: ±10)                   |
| Area           | ↑ ↓                  | Brightness +1 / −1 (Shift: ±10)                   |
| Area           | Page Up Page Down    | Brightness ±10                                    |
| Area           | Home End             | Saturation 0 / 100                                |
| Hue, alpha     | Slider keys          | See [Slider](/docs/components/slider#keyboard)    |
| Channel fields | ↑ ↓                  | Step the channel (Shift: ±10)                     |
| Channel fields | Enter, blur / Escape | Commit / revert the typed channel                 |
| Open panel     | Escape               | Close and restore the value the panel opened with |

An outside click closes the panel and keeps the current value.

## API Reference

### ColorPicker {#color-picker}

#### Props {#color-picker-props}

| Name          | Type                                                   | Default                   | Description                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value         | `string`                                               | -                         | Controlled value: a CSS color in the active `format`. `''` means no color — the field shows its placeholder and the panel starts from black.                                                       |
| defaultValue  | `string`                                               | ''                        | Uncontrolled initial value.                                                                                                                                                                        |
| format        | `ColorPickerFormat`                                    | -                         | Controlled format.                                                                                                                                                                                 |
| defaultFormat | `ColorPickerFormat`                                    | 'hex'                     | Uncontrolled initial format.                                                                                                                                                                       |
| alpha         | `boolean`                                              | true                      | Shows the alpha slider and field. `false` forces alpha to 1.                                                                                                                                       |
| swatches      | `string[]`                                             | ['#326FD1', '#C79807', …] | Preset colors for `ColorPicker.Swatches` (Core’s 11 presets by default). Pass `[]` to render none.                                                                                                 |
| orientation   | `ColorPickerOrientation`                               | 'vertical'                | Panel layout.                                                                                                                                                                                      |
| size          | `ColorPickerSize`                                      | 'base'                    | Trigger field size.                                                                                                                                                                                |
| open          | `boolean`                                              | -                         | Controlled open state of the popover panel.                                                                                                                                                        |
| defaultOpen   | `boolean`                                              | false                     | Uncontrolled initial open state.                                                                                                                                                                   |
| disabled      | `boolean`                                              | -                         | Disables every control and closes the panel. Inherited from a surrounding `Field`.                                                                                                                 |
| readOnly      | `boolean`                                              | -                         | Shows the value but blocks changes; the panel cannot open. Inherited from a surrounding `Field`.                                                                                                   |
| invalid       | `boolean`                                              | -                         | Invalid styling and `aria-invalid` on the field. Inherited from a surrounding `Field`.                                                                                                             |
| required      | `boolean`                                              | -                         | `aria-required` on the field. Inherited from a surrounding `Field`.                                                                                                                                |
| name          | `string`                                               | -                         | Submits the value under this name through a hidden input.                                                                                                                                          |
| form          | `string`                                               | -                         | `id` of the form the hidden input belongs to.                                                                                                                                                      |
| placeholder   | `string`                                               | -                         | Trigger field placeholder while the value is empty.                                                                                                                                                |
| labels        | `Partial<ColorPickerLabels>`                           | -                         | Overrides for the user-facing strings; blank entries fall back to the English defaults.                                                                                                            |
| children      | `React.ReactNode`                                      | -                         | Anatomy override. When omitted, the root renders `ColorPicker.Input` and a `ColorPicker.Content` holding the default `ColorPicker.Panel`. Render only a `ColorPicker.Panel` for the inline picker. |
| classNames    | `Partial<Record<"root", string>>`                      | -                         | Per-slot class name overrides.                                                                                                                                                                     |
| slotProps     | `Partial<Record<"root", HTMLAttributes<HTMLElement>>>` | -                         | Per-slot HTML attribute overrides.                                                                                                                                                                 |
| className     | `string`                                               | -                         | Appends custom classes to the root slot.                                                                                                                                                           |

#### Events {#color-picker-events}

| Name             | Type                                  | Default | Description                                                                                                                                                                     |
| ---------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onValueChange    | `(value: string) => void`             | -       | Fires on every change, including each frame of a drag, with the value serialized in the active `format`.                                                                        |
| onValueChangeEnd | `(value: string) => void`             | -       | Fires once per settled change: pointer release, a key press, a committed field, a swatch, the eyedropper, a format switch, or Escape restoring the value the panel opened with. |
| onFormatChange   | `(format: ColorPickerFormat) => void` | -       | Fires when the format select changes the notation. The value is re-serialized in it.                                                                                            |
| onOpenChange     | `(open: boolean) => void`             | -       | Fires when the popover panel opens or closes.                                                                                                                                   |

#### Data attributes {#color-picker-data-attributes}

| Attribute        | Applied when                                                      | Purpose                                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always                                                            | Stable selector for wrapper styling on the root slot.                                                                                                                       |
| data-layout      | Always                                                            | Reflects the resolved `orientation` (`vertical` \| `horizontal`) panel layout. Named `data-layout` rather than `data-orientation` so the inner sliders keep their own axis. |
| data-format      | Always                                                            | The active notation (`hex` \| `rgb` \| `hsl`); the recipe widens the channel row for three numeric fields.                                                                  |
| data-disabled    | When disabled (own prop or inherited from a surrounding `Field`)  | Blocks every control and keeps the panel closed.                                                                                                                            |
| data-readonly    | When read-only (own prop or inherited from a surrounding `Field`) | Shows the value while blocking changes; the panel cannot open.                                                                                                              |
| data-invalid     | When invalid (own prop or inherited from a surrounding `Field`)   | Invalid treatment; the trigger field also exposes `aria-invalid`.                                                                                                           |

### ColorPicker.Input {#color-picker-input}

#### Data attributes {#color-picker-input-data-attributes}

| Attribute           | Applied when | Purpose                                                             |
| ------------------- | ------------ | ------------------------------------------------------------------- |
| data-slot="root"    | Always       | Stable selector for wrapper styling on the root slot.               |
| data-slot="preview" | Always       | The leading dot painted with the current color over a checkerboard. |

### ColorPicker.Content {#color-picker-content}

#### Props {#color-picker-content-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| variant    | `PopoverVariant`                                             | 'white'       | Color variant.                                                             |
| classNames | `Partial<Record<"root", string>>`                            | -             | Per-slot extra classes.                                                    |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             | Per-slot HTML-attribute overrides.                                         |
| side       | `Side`                                                       | 'bottom'      | Side of trigger to position against                                        |
| align      | `Align`                                                      | 'center'      | Alignment relative to trigger                                              |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| trapFocus  | `boolean`                                                    | false         | Whether to trap focus within content                                       |
| className  | `string`                                                     | -             | Appends custom classes to the root slot.                                   |

#### Events {#color-picker-content-events}

| Name                 | Type                                          | Default | Description                                                                                                                                                                                                                                                                                                                          |
| -------------------- | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| onOpenAutoFocus      | `(event: Event) => void`                      | -       | Called when the popover opens, right before focus moves inside (to the first focusable element, else the content itself). Receives a cancelable `openautofocus` event; call `preventDefault()` to skip the auto-focus and leave focus where it is.                                                                                   |
| onFocusOutside       | `(event: FocusEvent) => void`                 | -       | Called when focus moves outside the content and trigger (non-modal, non-trapped popovers only). Receives a cancelable `focusoutside` `FocusEvent` dispatched on the newly focused element (native `focusin` is not cancelable); `event.target` is the element that received focus. Call `preventDefault()` to keep the popover open. |
| onInteractOutside    | `(event: PointerEvent \| FocusEvent) => void` | -       | Called for any outside interaction, after `onPointerDownOutside` or `onFocusOutside`, with the `pointerdown` event or the cancelable `focusoutside` `FocusEvent` described on `onFocusOutside`. Call `preventDefault()` on either to keep the popover open.                                                                          |
| onCloseAutoFocus     | `(event: Event) => void`                      | -       | Called when popover closes and focus returns to trigger                                                                                                                                                                                                                                                                              |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void`              | -       | Called when escape is pressed                                                                                                                                                                                                                                                                                                        |
| onPointerDownOutside | `(event: PointerEvent) => void`               | -       | Called when pointer down occurs outside the content                                                                                                                                                                                                                                                                                  |

#### Data attributes {#color-picker-content-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.Panel {#color-picker-panel}

#### Data attributes {#color-picker-panel-data-attributes}

| Attribute        | Applied when | Purpose                                                                               |
| ---------------- | ------------ | ------------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                 |
| data-layout      | Always       | The root’s `orientation`; the horizontal layout puts upright sliders beside the area. |
| role="group"     | Always       | Named by the surrounding `Field.Label`, else by `labels.panel`.                       |

### ColorPicker.Area {#color-picker-area}

#### Data attributes {#color-picker-area-data-attributes}

| Attribute                     | Applied when                            | Purpose                                                                                     |
| ----------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| data-slot="root"              | Always                                  | Stable selector for wrapper styling on the root slot.                                       |
| data-slot="thumb"             | Always                                  | The `role="slider"` thumb: `aria-valuenow` is saturation, `aria-valuetext` reads both axes. |
| data-dragging                 | On the thumb while the pointer drags    | Marks an active drag.                                                                       |
| data-focus                    | On the thumb while it holds focus       | Draws the focus ring.                                                                       |
| data-disabled / data-readonly | When the picker is disabled / read-only | Changes the cursor and mutes the plane.                                                     |

### ColorPicker.HueSlider {#color-picker-hue-slider}

#### Data attributes {#color-picker-hue-slider-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.AlphaSlider {#color-picker-alpha-slider}

#### Data attributes {#color-picker-alpha-slider-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.EyeDropper {#color-picker-eye-dropper}

#### Data attributes {#color-picker-eye-dropper-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.Preview {#color-picker-preview}

#### Data attributes {#color-picker-preview-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.FormatSelect {#color-picker-format-select}

#### Data attributes {#color-picker-format-select-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.ChannelFields {#color-picker-channel-fields}

#### Data attributes {#color-picker-channel-fields-data-attributes}

| Attribute         | Applied when          | Purpose                                               |
| ----------------- | --------------------- | ----------------------------------------------------- |
| data-slot="root"  | Always                | Stable selector for wrapper styling on the root slot. |
| data-slot="field" | On each channel Input | One typed channel (hex, R/G/B, H/S/L or alpha).       |

### ColorPicker.Swatches {#color-picker-swatches}

#### Data attributes {#color-picker-swatches-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### ColorPicker.Swatch {#color-picker-swatch}

#### Props {#color-picker-swatch-props}

| Name       | Type                                                   | Default | Description                                                     |
| ---------- | ------------------------------------------------------ | ------- | --------------------------------------------------------------- |
| value      | `string`                                               | -       | Color the swatch selects, in any notation `ColorPicker` parses. |
| classNames | `Partial<Record<"root", string>>`                      | -       | Per-slot class name overrides.                                  |
| slotProps  | `Partial<Record<"root", HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                              |
| className  | `string`                                               | -       | Appends custom classes to the root slot.                        |

#### Data attributes {#color-picker-swatch-data-attributes}

| Attribute        | Applied when                              | Purpose                                                                       |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| data-slot="root" | Always                                    | Stable selector for wrapper styling on the root slot.                         |
| data-selected    | When the swatch matches the current value | Draws the selection ring; `aria-pressed` carries it for assistive technology. |

### Type Definitions {#color-type-definitions}

| Name                         | Definition                                                                                                                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ColorPickerFormat            | `'hex' \| 'rgb' \| 'hsl'`                                                                                                                                                                                                                                                                          |
| ColorPickerOrientation       | `'vertical' \| 'horizontal'`                                                                                                                                                                                                                                                                       |
| ColorPickerSize              | `'small' \| 'base' \| 'large'`                                                                                                                                                                                                                                                                     |
| ColorPickerLabels            | `{ panel: string; trigger: string; area: string; areaRoleDescription: string; areaValue: string; hue: string; alpha: string; hex: string; red: string; green: string; blue: string; saturation: string; lightness: string; format: string; eyeDropper: string; swatches: string; swatch: string }` |
| ColorPickerInputSlot         | `'root' \| 'preview'`                                                                                                                                                                                                                                                                              |
| PopoverVariant               | `'white' \| 'dark' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'`                                                                                                                                                                                                                   |
| Side                         | `'top' \| 'right' \| 'bottom' \| 'left'`                                                                                                                                                                                                                                                           |
| Align                        | `'start' \| 'center' \| 'end'`                                                                                                                                                                                                                                                                     |
| ColorPickerPanelSlot         | `'root' \| 'controls' \| 'sliders' \| 'fields'`                                                                                                                                                                                                                                                    |
| ColorPickerAreaSlot          | `'root' \| 'thumb'`                                                                                                                                                                                                                                                                                |
| ColorPickerChannelFieldsSlot | `'root' \| 'field'`                                                                                                                                                                                                                                                                                |

## Source

- Docs: `apps/docs/docs/components/color-picker.mdx`
- Component: `packages/react-spar/src/components/color-picker/`
- Live docs: https://v2.takeoffui.com/docs/components/color-picker
