---
name: takeoff-color-picker
description:
  'Build a ColorPicker — the ColorPicker from @takeoff-ui/react-spar (Takeoff UI
  / Spar React) for choosing a color with a saturation/brightness area, hue and
  alpha sliders, typed HEX / RGB / HSL fields, an eyedropper and preset
  swatches, in a popover under a typable field or inline. Trigger contexts:
  color picker, color input, brand/theme color setting, hex input with preview,
  RGBA / HSLA value, opacity slider, preset color swatches, eyedropper, inline
  color panel. Use this skill WHENEVER building, adding, importing, styling, or
  fixing a color picker or color field in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar.'
---

# ColorPicker — @takeoff-ui/react-spar

`ColorPicker` is a typable color field that opens a panel: a saturation ×
brightness area, hue and alpha sliders, typed channel fields (HEX, R G B or H S
L, plus alpha), an eyedropper and preset swatches. Spar has no slider or 2D-area
primitive, so the wrapper owns the value model and the area; the popover is
`Popover`, the sliders are `Slider`, the fields are `Input` and `Select`.

**When to use:** any setting whose value is a color — brand/theme color, label
or category color, chart series color. Wrap it in `Field` for a label,
description and error. Not this — a fixed palette with no free choice is a
`takeoff-radio` group; a single hex text box without a picker is
`takeoff-input`.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill). Then import:

```tsx
import { ColorPicker, Field } from '@takeoff-ui/react-spar';
```

## Compound parts

- `ColorPicker.Input` — the typable trigger field (preview dot, text, chevron
  that toggles the panel).
- `ColorPicker.Content` — the floating panel surface (`Popover.Content`).
- `ColorPicker.Panel` — the `role="group"` layout owner; renders the default
  panel when childless. **Without `Content` it is the inline picker.**
- `ColorPicker.Area`, `ColorPicker.HueSlider`, `ColorPicker.AlphaSlider`,
  `ColorPicker.EyeDropper`, `ColorPicker.Preview`, `ColorPicker.FormatSelect`,
  `ColorPicker.ChannelFields`, `ColorPicker.Swatches` > `ColorPicker.Swatch`.

A childless `<ColorPicker />` renders Input + Content + the default Panel.

## Basic usage

```tsx
<Field>
  <Field.Label>Brand color</Field.Label>
  <ColorPicker defaultValue="#326fd1" />
</Field>
```

## Examples

### Controlled, with a format

```tsx
const [color, setColor] = useState('rgb(50, 111, 209)');
<ColorPicker value={color} onValueChange={setColor} format="rgb" />;
```

`value` is a CSS string in the active `format`: `#rrggbb` / `#rrggbbaa`, `rgb()`
/ `rgba()`, `hsl()` / `hsla()`; `''` means no color. Typed text is parsed in
**any** of the three notations; junk is rejected (the value stays).
`onValueChange` streams every change (drag frames too); `onValueChangeEnd` fires
once per settled change — persist there.

### Inline

```tsx
<ColorPicker value={color} onValueChange={setColor}>
  <ColorPicker.Panel />
</ColorPicker>
```

### Layout, alpha, swatches

```tsx
<ColorPicker
  orientation="horizontal"
  alpha={false}
  swatches={['#119c8d', '#ff6259']}
/>
```

### Custom panel

```tsx
<ColorPicker defaultValue="#a45e3c">
  <ColorPicker.Panel>
    <ColorPicker.Area />
    <ColorPicker.HueSlider />
    <ColorPicker.ChannelFields />
    <ColorPicker.Swatches>
      <ColorPicker.Swatch value="#a45e3c" />
    </ColorPicker.Swatches>
  </ColorPicker.Panel>
</ColorPicker>
```

### Form submission

```tsx
<ColorPicker name="theme" defaultValue="#ff6259" /> // hidden input carries the committed value
```

## Key props

| Prop                                             | Type                           | Default      | Notes                                                     |
| ------------------------------------------------ | ------------------------------ | ------------ | --------------------------------------------------------- |
| `value` / `defaultValue`                         | `string`                       | `''`         | CSS color in the active format; `''` = no color.          |
| `onValueChange`                                  | `(value: string) => void`      | -            | Every change, including drag frames.                      |
| `onValueChangeEnd`                               | `(value: string) => void`      | -            | Once per settled change.                                  |
| `format` / `defaultFormat` / `onFormatChange`    | `'hex' \| 'rgb' \| 'hsl'`      | `'hex'`      | Notation of the value; switching re-serializes the color. |
| `alpha`                                          | `boolean`                      | `true`       | `false` hides alpha controls and forces opacity 1.        |
| `swatches`                                       | `string[]`                     | Core's 11    | Preset row; `[]` removes it.                              |
| `orientation`                                    | `'vertical' \| 'horizontal'`   | `'vertical'` | Core's two panel layouts.                                 |
| `size`                                           | `'small' \| 'base' \| 'large'` | `'base'`     | Trigger field size.                                       |
| `open` / `defaultOpen` / `onOpenChange`          | `boolean`                      | `false`      | Popover state.                                            |
| `disabled` / `readOnly` / `invalid` / `required` | `boolean`                      | `false`      | Inherited from `Field`; disabled/read-only never open.    |
| `name` / `form`                                  | `string`                       | -            | Hidden-input form submission.                             |
| `placeholder`                                    | `string`                       | -            | Trigger field placeholder.                                |
| `labels`                                         | `Partial<ColorPickerLabels>`   | English      | Every user-facing string; blanks fall back.               |

Full props, events, data attributes and per-part APIs:
`references/full-docs.md`.

## Accessibility

- The area thumb is one `role="slider"` (`aria-roledescription` "2D slider",
  `aria-valuetext` "Saturation 50%, Brightness 80%"). ←/→ saturation, ↑/↓
  brightness, Shift ×10, PageUp/PageDown brightness ±10, Home/End saturation.
- Hue and alpha are Takeoff `Slider`s with Slider's full keyboard. Channel
  fields step with ↑/↓ and commit on Enter/blur; Escape reverts their text.
- The trigger field commits on Enter/blur, reverts on Escape, opens on ↓. Escape
  in the open panel restores the value it opened with; an outside click keeps
  the current value.
- A surrounding `Field` names the field and the panel group; inner controls keep
  their own names (Hue, Opacity, Hex…).

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/color-picker
- Source: `packages/react-spar/src/components/color-picker/`
- Spar primitive: none for the area/sliders; `Popover` and `FieldReset` from
  Spar.
